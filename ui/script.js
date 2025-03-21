$(document).ready(function(){
  // Helper function to format numbers with commas
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  window.addEventListener('message', function(event){
    const data = event.data;
    if(data.action === 'open'){
      $('body').show();
      $('#menuTitle').text(data.title || "CS-AdminMenu");
      // Refresh player list when menu opens
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
    } else if(data.action === "showPlayerMoney"){
      $("#playerCash").text("Cash: $" + formatNumber(data.cash));
      $("#playerBank").text("Bank: $" + formatNumber(data.bank));
      $(".player-money-panel").show();
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
      $('.action-panel').removeClass('show'); // hide any open island
      // Request player's money automatically when a player is selected
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify({ action: "show_player_money", target: val }));
    } else {
      $('#playerActions').slideUp();
      $('.more-options-icon').hide();
      $('.action-panel').removeClass('show');
      $(".player-money-panel").hide();
    }
  });
  
  // Toggle More Options panel when ellipsis icon is clicked
  $('.more-options-icon').click(function(e){
    e.stopPropagation();
    if($('#moreOptionsPanel').hasClass('show')){
      $('#moreOptionsPanel').removeClass('show');
    } else {
      $('.action-panel').removeClass('show'); // close any other
      $('#moreOptionsPanel').addClass('show');
    }
  });
  
  // Toggle form for Give Money
  $('[data-action="toggle_give_money"]').click(function(e){
    e.stopPropagation();
    $('#moneyForm').slideToggle();
  });
  
  // Toggle form for Give Item
  $('[data-action="toggle_give_item"]').click(function(e){
    e.stopPropagation();
    $('#itemForm').slideToggle();
  });
  
  $('.menu-btn').click(function(e){
    e.stopPropagation();
    const action = $(this).data('action');
    
    // Island-opening actions
    if(action === 'show_give_money'){
      $('.action-panel').removeClass('show');
      $('#giveMoneyPanel').addClass('show');
      return;
    }
    if(action === 'show_kick_panel'){
      $('.action-panel').removeClass('show');
      $('#kickPanel').addClass('show');
      return;
    }
    if(action === 'show_ban_panel'){
      $('.action-panel').removeClass('show');
      $('#banPanel').addClass('show');
      return;
    }
    if(action === 'show_unban_panel'){
      $('.action-panel').removeClass('show');
      $('#unbanPanel').addClass('show');
      return;
    }
    
    // Confirm / Cancel actions for islands
    if(action === 'confirm_give_money' || action === 'cancel_give_money'){
      if(action === 'confirm_give_money'){
        let payload = { action: 'give_money' };
        payload.target = $('#playerSelect').val();
        payload.amount = $('#moneyAmount').val();
        payload.moneyType = $('#moneyType').val();
        $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload), function(response){
          $('#moneyForm').slideUp();
          $('#giveMoneyPanel').removeClass('show');
        });
      } else {
        $('#moneyForm').slideUp();
        $('#giveMoneyPanel').removeClass('show');
      }
      return;
    }
    
    if(action === 'confirm_kick' || action === 'cancel_kick'){
      if(action === 'confirm_kick'){
        let payload = { action: 'kick_player' };
        payload.target = $('#playerSelect').val();
        payload.reason = $('#kickReason').val();
        $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload), function(response){
          $('#kickPanel').removeClass('show');
        });
      } else {
        $('#kickPanel').removeClass('show');
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
          $('#banPanel').removeClass('show');
        });
      } else {
        $('#banPanel').removeClass('show');
      }
      return;
    }
    
    if(action === 'confirm_unban' || action === 'cancel_unban'){
      if(action === 'confirm_unban'){
        let payload = { action: 'unban_player' };
        payload.banId = $('#unbanId').val();
        $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload), function(response){
          $('#unbanPanel').removeClass('show');
        });
      } else {
        $('#unbanPanel').removeClass('show');
      }
      return;
    }
    
    // Custom clothing menu action
    if(action === 'give_clothing_menu'){
      let payload = { action: 'give_clothing_menu' };
      payload.target = $('#playerSelect').val();
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload), function(response){
         $('#moreOptionsPanel').removeClass('show');
      });
      return;
    }
    
    // Open Inventory action using the server event trigger
    if(action === 'open_inventory'){
      let payload = { action: 'open_inventory' };
      payload.target = $('#playerSelect').val();
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload), function(response){
         $('#moreOptionsPanel').removeClass('show');
      });
      return;
    }
    
    // Confirm Give Item action
    if(action === 'give_item'){
      let payload = { action: 'give_item' };
      payload.target = $('#playerSelect').val();
      payload.item = $('#itemName').val();
      payload.quantity = $('#itemQuantity').val();
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload), function(response){
         $('#itemForm').slideUp();
         $('#moreOptionsPanel').removeClass('show');
      });
      return;
    }
    
    // For core player actions
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
