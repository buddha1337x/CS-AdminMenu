$(document).ready(function(){
  // Helper: Format numbers with commas
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  // Preset function to apply a given menu style preset
  function applyPreset(preset) {
    if(preset === "light_pink") {
      // Light Pink preset
      $("#adminMenu").css("background", "#ffb6c1");
    } else if(preset === "modern") {
      // Modern preset with background image
      $("#adminMenu").css({
        "background": "url('https://r2.fivemanage.com/TT09HlxUtRUDiHGn61d49/image/wp12177501.webp') no-repeat center center / cover"
      });
    } else if(preset === "light_red") {
      // Light Red preset
      $("#adminMenu").css("background", "#ffcccb");
    }
  }
  
  // When a preset button is clicked, apply the corresponding preset.
  $(".preset-btn").on("click", function(){
    let preset = $(this).data("preset");
    applyPreset(preset);
  });
  
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
    
    // Hide all tab content and then show the selected one
    $('.tab-content').hide();
    $('#content-' + selectedTab).fadeIn();
    
    // Expand the menu horizontally if the vehicle tab is active
    if(selectedTab === 'vehicle'){
      $('#adminMenu').addClass('expanded-vehicle');
    } else {
      $('#adminMenu').removeClass('expanded-vehicle');
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
  
  // Section header toggle for collapsible sections:
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
    if(data.action === 'openVehicleIsland'){
      $('.island-panel').removeClass('active').fadeOut();
      $('#island-vehicle').addClass('active').fadeIn();
    }
  });
  
  // Function to close an island panel
  window.closeIsland = function(id) {
    $('#' + id).removeClass('active').fadeOut();
  };
  
  // Core admin menu button actions:
  $('.menu-btn').on('click', function(e){
    e.stopPropagation();

    // Only play the click sound if soundToggle is checked.
    if ($('#soundToggle').is(':checked')) {
      clickSound.play().catch(function(error) {
        console.error("Error playing click sound:", error);
      });
    }
    
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
    if(action === 'spawn_vehicle'){
      let payload = { action: 'spawn_vehicle' };
      payload.vehicleModel = $('#vehicleModel').val();
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
  
  // Draggable functionality for the menu using the header (grab cursor)
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
  
  $("#menuHeader").css("cursor", "grab");
  
  // Optional: Theme application functionality (if using a theme input elsewhere)
  $('#applyThemeBtn').on('click', function(){
    var newColor = $('#headerColorPicker').val();
    $('.menu-header').css('background', newColor);
    $('#adminMenu').css('background', newColor);
  });

  // Set a reduced volume for the click sound
  var clickSound = document.getElementById('clickSound');
  if(clickSound) {
    clickSound.volume = 0.3; // Volume level from 0.0 to 1.0
  }

  $('.dropdown-btn').on('click', function(e){
    e.stopPropagation();
    const dropdownId = $(this).data('dropdown');
    // Toggle the corresponding dropdown-content (based on element ID)
    $('#dropdown-' + dropdownId).slideToggle();
  });

  // Global pagination variables
  let currentPage = 1;
  const itemsPerPage = 18;

  // Expanded vehicles array
  const vehicles = [
    { category: "Sports", name: "Elegy", model: "elegy" },
    { category: "Muscle", name: "Ruiner", model: "ruiner" },
    { category: "SUV", name: "Baller", model: "baller" },
    { category: "Sedan", name: "Premier", model: "premier" },
    { category: "Sports", name: "Sultan RS", model: "sultanrs" },
    { category: "Super", name: "Zentorno", model: "zentorno" },
    { category: "Sports", name: "Tyrus", model: "tyrus" },
    { category: "Sedan", name: "Oracle", model: "oracle" },
    { category: "SUV", name: "XLS", model: "xls" },
    { category: "Sports", name: "Penumbra", model: "penumbra" },
    { category: "Super", name: "Turismo R", model: "turismor" },
    // Existing additional vehicles
    { category: "Sedan", name: "Asea", model: "asea" },
    { category: "Sedan", name: "Fugitive", model: "fugitive" },
    { category: "Sports", name: "Banshee", model: "banshee" },
    { category: "Super", name: "Infernus", model: "infernus" },
    { category: "Sports", name: "NineF", model: "ninef" },
    { category: "Sports", name: "Rapid GT", model: "rapidgt" },
    { category: "SUV", name: "Huntley", model: "huntley" },
    { category: "Muscle", name: "Dominator", model: "dominator" },
    { category: "Sports", name: "Furore GT", model: "furoregt" },
    { category: "SUV", name: "Cavalcade", model: "cavalcade" },
    // New vehicles added
    { category: "Super", name: "Adder", model: "adder" },
    { category: "Sports", name: "Bullet", model: "bullet" },
    { category: "Sports", name: "Cheetah", model: "cheetah" },
    { category: "Sports", name: "Coquette", model: "coquette" },
    { category: "Muscle", name: "Gauntlet", model: "gauntlet" },
    { category: "SUV", name: "Granger", model: "granger" },
    { category: "Super", name: "Osiris", model: "osiris" },
    { category: "Super", name: "Tampa", model: "tampa" },
    { category: "Sports", name: "Rapid GT 2", model: "rapidgt2" },
    // 30 New vehicles:
    { category: "Sports", name: "Stinger", model: "stinger" },
    { category: "Sports", name: "Tempesta", model: "tempesta" },
    { category: "Super", name: "Vortex", model: "vortex" },
    { category: "Super", name: "Tyrant", model: "tyrant" },
    { category: "Muscle", name: "Phantom", model: "phantom" },
    { category: "Muscle", name: "Lurcher", model: "lurcher" },
    { category: "SUV", name: "Brawler", model: "brawler" },
    { category: "SUV", name: "Kamacho", model: "kamacho" },
    { category: "Sports", name: "Futo", model: "futo" },
    { category: "Sports", name: "Jester", model: "jester" },
    { category: "Sedan", name: "Stretch", model: "stretch" },
    { category: "Sports", name: "Sultan", model: "sultan" },
    { category: "Super", name: "Entity XF", model: "entityxf" },
    { category: "SUV", name: "Blista", model: "blista" },
    { category: "Sports", name: "Raiden", model: "raiden" },
    { category: "Sports", name: "Rapid GT 3", model: "rapidgt3" },
    { category: "Super", name: "Vacca", model: "vacca" },
    { category: "Sports", name: "Sentinel", model: "sentinel" },
    { category: "Sports", name: "Feltzer 2", model: "feltzer2" },
    { category: "Muscle", name: "Hotknife", model: "hotknife" },
    { category: "SUV", name: "Mesa", model: "mesa" }
  ];
  
  // Function to render vehicle catalog with optional search filtering and pagination
  function renderVehicleCatalog(filter = "") {
    const container = $("#vehicleCatalog");
    container.empty();
    
    // Filter vehicles by name (case-insensitive)
    const filtered = vehicles.filter(v => v.name.toLowerCase().includes(filter.toLowerCase()));
    
    if(filtered.length === 0) {
      container.append("<p>No vehicles found.</p>");
      return;
    }
    
    // Calculate pagination values
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if(currentPage > totalPages) currentPage = totalPages;
    if(currentPage < 1) currentPage = 1;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const vehiclesToShow = filtered.slice(startIndex, endIndex);
    
    // Render vehicle cards
    vehiclesToShow.forEach(veh => {
      const imageUrl = `https://raw.githubusercontent.com/MericcaN41/gta5carimages/main/images/${veh.model}.png`;
      const card = $(`
        <div class="vehicle-card">
          <img src="${imageUrl}" alt="${veh.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/150';">
          <p>${veh.name}</p>
          <button data-action="spawn_vehicle" data-model="${veh.model}">Spawn</button>
        </div>
      `);
      container.append(card);
    });
    
    // Create and append pagination controls if there is more than one page
    if(totalPages > 1) {
      // Added extra padding-right to move the arrows farther right
      const pagination = $('<div class="pagination-controls" style="margin-top:10px; text-align:right; padding-right:20px;"></div>');
      
      // Previous arrow icon (clickable, white)
      const prevIcon = $(`
        <i class="fa-solid fa-arrow-left" style="cursor:pointer; margin:0 10px; color:#fff;"></i>
      `);
      prevIcon.on("click", function(){
        if(currentPage > 1){
          currentPage--;
          renderVehicleCatalog(filter);
        }
      });
      pagination.append(prevIcon);
      
      // Next arrow icon (clickable, white)
      const nextIcon = $(`
        <i class="fa-solid fa-arrow-right" style="cursor:pointer; margin:0 10px; color:#fff;"></i>
      `);
      nextIcon.on("click", function(){
        if(currentPage < totalPages){
          currentPage++;
          renderVehicleCatalog(filter);
        }
      });
      pagination.append(nextIcon);
      
      container.append(pagination);
    }
  }
  
  // Initial render of the vehicle catalog
  renderVehicleCatalog();
  
  // Handle search input filtering
  $("#vehicleSearch").on("input", function(){
    currentPage = 1; // Reset to first page on new search
    const searchTerm = $(this).val();
    renderVehicleCatalog(searchTerm);
  });
  
  // Handle spawn vehicle button clicks using delegation
  $("#vehicleCatalog").on("click", "button[data-action='spawn_vehicle']", function(){
    const model = $(this).data("model");
    const replaceCurrent = window.isInVehicle || false;
    $.post(`https://${GetParentResourceName()}/adminAction`, JSON.stringify({ 
      action: "spawn_vehicle", 
      vehicleModel: model,
      replace: replaceCurrent
    }));
  });
});
