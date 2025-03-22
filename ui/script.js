$(document).ready(function(){
  // Helper: Format numbers with commas
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  // When the players dropdown changes inside the Players section:
  $('#playerSelect').on('change', function(){
    let val = $(this).val();
    if(val && val !== ""){
      $('#playerActions').slideDown();
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify({ action: "show_player_money", target: val }));
    } else {
      $('#playerActions').slideUp();
    }
  });
  
  // Vertical tab button handler – for island panels and left-side content
  $('.tab-btn').on('click', function(){
    const selectedTab = $(this).data('tab');
    $('.tab-btn').removeClass('active');
    $(this).addClass('active');
    
    // Hide all left-side content and island panels
    $('.tab-content').hide();
    $('.island-panel').removeClass('active').fadeOut();
    
    // If selected tab is "kick", "ban", or "unban", show corresponding island
    if(selectedTab === "kick" || selectedTab === "ban" || selectedTab === "unban"){
      $('#island-' + selectedTab).addClass('active').fadeIn();
    } else {
      $('#content-' + selectedTab).fadeIn();
    }
    
    // Show player's money panel only when the players tab (assumed "clothing") is active
    if(selectedTab !== "clothing"){
      $("#playerMoneyPanel").fadeOut();
    } else {
      $("#playerMoneyPanel").fadeIn();
    }
  });
  
  // Set default active left-side tab to "money" (Self Actions)
  $('.tab-btn[data-tab="money"]').addClass('active');
  $('.tab-content').hide();
  $('#content-money').show();
  $('.island-panel').removeClass('active').hide();
  
  // Global message handling from server:
  window.addEventListener('message', function(event){
    const data = event.data;
    if(data.action === 'open'){
      $('body').show();
      $('#menuTitle').text(data.title || "CS-AdminMenu");
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
  $('.section-header').on('click', function(){
    let content = $(this).next('.section-content');
    content.slideToggle();
    let icon = $(this).find('.toggle-icon');
    if(icon.hasClass('fa-caret-right')){
      icon.removeClass('fa-caret-right').addClass('fa-caret-down');
    } else {
      icon.removeClass('fa-caret-down').addClass('fa-caret-right');
    }
  });
  
  // When the logo image in the tabs container is clicked, open Classic Scripts website:
  $('#tabsContainer img').on('click', function(){
    window.invokeNative('openUrl', 'https://www.classic-scripts.com');
  });
  
  // Listen for island opening commands from client.lua:
  window.addEventListener('message', function(event) {
    const data = event.data;
    if(data.action === 'openKickIsland'){
      $('.island-panel').removeClass('active').fadeOut();
      $('#island-kick').addClass('active').fadeIn();
    }
    if(data.action === 'openBanIsland'){
      $('.island-panel').removeClass('active').fadeOut();
      $('#island-ban').addClass('active').fadeIn();
    }
    if(data.action === 'openUnbanIsland'){
      $('.island-panel').removeClass('active').fadeOut();
      $('#island-unban').addClass('active').fadeIn();
    }
  });
  
  // Function to close an island panel (called from the close button)
  window.closeIsland = function(id) {
    $('#' + id).removeClass('active').fadeOut();
  };
  
  // Core admin menu button actions:
  $('.menu-btn').on('click', function(e){
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
      payload.reason = $('#kickReasonIsland').val() || $('#kickReason').val();
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload));
      return;
    }
    if(action === 'confirm_ban'){
      let payload = { action: 'ban_player' };
      payload.target = $('#playerSelect').val();
      payload.reason = $('#banReasonIsland').val() || $('#banReason').val();
      payload.duration = $('#banDurationIsland').val() || $('#banDuration').val();
      $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify(payload));
      return;
    }
    if(action === 'confirm_unban'){
      let payload = { action: 'unban_player' };
      payload.banId = $('#unbanIdIsland').val() || $('#unbanId').val();
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
  
  // Draggable functionality for the menu using the header (using "grab" cursor)
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  
  $("#menuHeader").on("mousedown", function(e) {
    isDragging = true;
    $(this).css("cursor", "grabbing");
    let pos = $("#menuWrapper").offset();
    dragOffset.x = e.pageX - pos.left;
    dragOffset.y = e.pageY - pos.top;
  });
  
  $(document).on("mousemove", function(e) {
    if(isDragging) {
      $("#menuWrapper").offset({
        left: e.pageX - dragOffset.x,
        top: e.pageY - dragOffset.y
      });
    }
  });
  
  $(document).on("mouseup", function() {
    isDragging = false;
    $("#menuHeader").css("cursor", "grab");
  });
  
  // Set initial cursor for draggable header
  $("#menuHeader").css("cursor", "grab");
  
  // Optional: Theme application functionality:
  $('#applyThemeBtn').on('click', function(){
    var newColor = $('#headerColorPicker').val();
    $('.menu-header').css('background', newColor);
    $('#adminMenu').css('background', newColor);
  });
});
