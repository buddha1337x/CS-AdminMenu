$(document).ready(function(){
  window.addEventListener('message', function(event){
    const data = event.data;
    if(data.action === 'open'){
      $('body').show();
      $('#menuTitle').text(data.title || "CS-AdminMenu");
      // Refresh player list once when the menu opens
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify({ action: "getPlayerList" }));
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
      $('.more-options-icon').show();
      $('.action-panel').fadeOut(); // hide any open island when a new player is selected
    } else {
      $('#playerActions').slideUp();
      $('.more-options-icon').hide();
      $('.action-panel').fadeOut();
    }
  });
  
  // Ellipsis icon click handler for more options island
  $('.more-options-icon').click(function(e){
    e.stopPropagation();
    // Toggle the More Options panel and close any other panel
    if($('#moreOptionsPanel').is(':visible')){
      $('#moreOptionsPanel').fadeOut();
    } else {
      $('.action-panel').fadeOut();
      $('#moreOptionsPanel').fadeIn();
    }
  });
  
  $('.menu-btn').click(function(e){
    e.stopPropagation();
    const action = $(this).data('action');
    // First, hide all action panels
    $('.action-panel').fadeOut();
    
    // Island-opening actions:
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
    
    // Confirm / Cancel actions for islands:
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
    
    // Core player actions: send them to server
    let payload = { action: action };
    if(['revive_player','bring_player','teleport_player','kick_player','ban_player','unban_player'].includes(action)){
      payload.target = $('#playerSelect').val();
    }
    $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload), function(response){
      if(action === 'close'){
        $('body').hide();
      }
    });
  });
});
