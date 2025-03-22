$(document).ready(function(){
  // Helper: Format numbers with commas
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  // When the players dropdown changes inside the "money" tab:
  $('#playerSelect').on('change', function(){
    let val = $(this).val();
    if(val && val !== ""){
      $('#playerActions').slideDown();
      // Request player's money info from the server
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify({ action: "show_player_money", target: val }));
    } else {
      $('#playerActions').slideUp();
    }
  });
  
  // Set default active tab to "money" (with person icon)
  $('.tab-btn[data-tab="money"]').addClass('active');
  $('.tab-content').hide();
  $('#content-money').show();

  $(document).ready(function() {
    $('.tab-btn').on('click', function() {
      const selectedTab = $(this).data('tab');
      $('.tab-btn').removeClass('active');
      $(this).addClass('active');
      $('.tab-content').hide();
      $('#content-' + selectedTab).fadeIn();
    });
  });
  
  // Global message handling from server:
  window.addEventListener('message', function(event){
    const data = event.data;
    if(data.action === 'open'){
      $('body').show();
      $('#menuTitle').text(data.title || "CS-AdminMenu");
      // Refresh player list from server
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
  
  // Standard section header toggle for collapsible sections:
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
  
  // Core admin menu button actions:
  $('.menu-btn').click(function(e){
    e.stopPropagation();
    const action = $(this).data('action');
    
    if(action === 'confirm_give_money'){
      let payload = { action: 'give_money' };
      payload.target = $('#playerSelect').val();
      payload.amount = $('#moneyAmount').val();
      payload.moneyType = $('#moneyType').val();
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload));
      return;
    }
    if(action === 'confirm_kick'){
      let payload = { action: 'kick_player' };
      payload.target = $('#playerSelect').val();
      payload.reason = $('#kickReason').val();
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload));
      return;
    }
    if(action === 'confirm_ban'){
      let payload = { action: 'ban_player' };
      payload.target = $('#playerSelect').val();
      payload.reason = $('#banReason').val();
      payload.duration = $('#banDuration').val();
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload));
      return;
    }
    if(action === 'confirm_unban'){
      let payload = { action: 'unban_player' };
      payload.banId = $('#unbanId').val();
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload));
      return;
    }
    if(action === 'give_clothing_menu'){
      let payload = { action: 'give_clothing_menu' };
      payload.target = $('#playerSelect').val();
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload));
      return;
    }
    if(action === 'open_inventory'){
      let payload = { action: 'open_inventory' };
      payload.target = $('#playerSelect').val();
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload));
      return;
    }
    if(action === 'give_item'){
      let payload = { action: 'give_item' };
      payload.target = $('#playerSelect').val();
      payload.item = $('#itemName').val();
      payload.quantity = $('#itemQuantity').val();
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload));
      return;
    }
    
    let payload = { action: action };
    if(['revive_player','bring_player','teleport_player','kick_player','ban_player','unban_player'].includes(action)){
      payload.target = $('#playerSelect').val();
    }
    $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload));
  });
});
