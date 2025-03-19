$(document).ready(function(){
  window.addEventListener('message', function(event){
    const data = event.data;
    if(data.action === 'open'){
      $('body').show();
      $('#menuTitle').text(data.title || "CS-AdminMenu");
    } else if(data.action === 'close'){
      $('body').hide();
    } else if(data.action === 'updatePlayerList'){
      let select = $('#playerSelect');
      select.empty();
      select.append('<option value="">Select a player</option>');
      data.players.forEach(player => {
        select.append('<option value="'+ player.id +'">'+ player.name +'</option>');
      });
    }
  });
  
  $('.section-header').click(function(){
    let content = $(this).next('.section-content');
    content.slideToggle();
    let icon = $(this).find('.toggle-icon');
    if(icon.hasClass('fa-caret-right')){
      icon.removeClass('fa-caret-right').addClass('fa-caret-down');
    } else {
      icon.removeClass('fa-caret-down').addClass('fa-caret-right');
    }
  });
  
  $('#playerSelect').on('change', function(){
    let val = $(this).val();
    if(val && val !== ""){
      $('#playerActions').slideDown();
    } else {
      $('#playerActions').slideUp();
    }
  });
  
  $('.menu-btn').click(function(){
    const action = $(this).data('action');
    
    if(action === 'show_give_money'){
      $('#giveMoneyPanel').fadeIn();
      return;
    }
    
    if(action === 'show_kick_panel'){
      $('#kickPanel').fadeIn();
      return;
    }
    
    if(action === 'show_ban_panel'){
      $('#banPanel').fadeIn();
      return;
    }
    
    if(action === 'show_unban_panel'){
      $('#unbanPanel').fadeIn();
      return;
    }
    
    if(action === 'confirm_give_money' || action === 'cancel_give_money'){
      if(action === 'confirm_give_money'){
        let payload = { action: 'give_money' };
        payload.target = $('#playerSelect').val();
        payload.amount = $('#moneyAmount').val();
        payload.moneyType = $('#moneyType').val();
        $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload), function(response){
          $('#giveMoneyPanel').fadeOut();
        });
      } else {
        $('#giveMoneyPanel').fadeOut();
      }
      return;
    }
    
    if(action === 'confirm_kick' || action === 'cancel_kick'){
      if(action === 'confirm_kick'){
        let payload = { action: 'kick_player' };
        payload.target = $('#playerSelect').val();
        payload.reason = $('#kickReason').val();
        $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload), function(response){
          $('#kickPanel').fadeOut();
        });
      } else {
        $('#kickPanel').fadeOut();
      }
      return;
    }
    
    if(action === 'confirm_ban' || action === 'cancel_ban'){
      if(action === 'confirm_ban'){
        let payload = { action: 'ban_player' };
        payload.target = $('#playerSelect').val();
        payload.reason = $('#banReason').val();
        payload.duration = $('#banDuration').val();
        $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload), function(response){
          $('#banPanel').fadeOut();
        });
      } else {
        $('#banPanel').fadeOut();
      }
      return;
    }
    
    if(action === 'confirm_unban' || action === 'cancel_unban'){
      if(action === 'confirm_unban'){
        let payload = { action: 'unban_player' };
        payload.banId = $('#unbanId').val();
        $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload), function(response){
          $('#unbanPanel').fadeOut();
        });
      } else {
        $('#unbanPanel').fadeOut();
      }
      return;
    }
    
    let payload = { action: action };
    if(['revive_player','bring_player','teleport_player'].includes(action)){
      payload.target = $('#playerSelect').val();
    }
    $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload), function(response){
      if(action === 'close'){
        $('body').hide();
      }
    });
  });
});
