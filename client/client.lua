local adminMenuOpen = false
local noclipEnabled = false

RegisterNetEvent("cs-adminmenu:client:openMenu", function(title)
    adminMenuOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({ action = "open", title = title, position = Config.NotificationPosition })
end)

local function CloseAdminMenu()
    adminMenuOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = "close" })
end

RegisterNUICallback("adminAction", function(data, cb)
    local action = data.action
    local ped = PlayerPedId()
    if action == "close" then
        CloseAdminMenu()
    elseif action == "revive" then
        local coords = GetEntityCoords(ped)
        NetworkResurrectLocalPlayer(coords, true, true, false)
        SetEntityHealth(ped, 200)
        TriggerEvent('QBCore:Notify', "You revived yourself!", "success")
    elseif action == "godmode" then
        local current = GetPlayerInvincible(ped)
        SetPlayerInvincible(ped, not current)
        TriggerEvent('QBCore:Notify', "Godmode " .. (current and "disabled" or "enabled") .. "!", "success")
    elseif action == "teleport" then
        local blip = GetFirstBlipInfoId(8)
        if DoesBlipExist(blip) then
            local coords = GetBlipCoords(blip)
            SetEntityCoords(ped, coords.x, coords.y, coords.z, false, false, false, true)
            TriggerEvent('QBCore:Notify', "Teleported to waypoint!", "success")
        else
            TriggerEvent('QBCore:Notify', "No waypoint set!", "error")
        end
    elseif action == "noclip" then
        noclipEnabled = not noclipEnabled
        if noclipEnabled then
            TriggerEvent('cs-adminmenu:client:enableNoclip')
            TriggerEvent('QBCore:Notify', "Noclip enabled", "success")
        else
            TriggerEvent('cs-adminmenu:client:disableNoclip')
            TriggerEvent('QBCore:Notify', "Noclip disabled", "success")
        end
    elseif action == "fix_vehicle" then
        local veh = GetVehiclePedIsIn(ped, false)
        if veh and veh ~= 0 then
            SetVehicleFixed(veh)
            SetVehicleDeformationFixed(veh)
            TriggerEvent('QBCore:Notify', "Vehicle fixed!", "success")
        else
            TriggerEvent('QBCore:Notify', "Not in a vehicle", "error")
        end
    elseif action == "getPlayerList" then
        TriggerServerEvent("cs-adminmenu:server:getPlayers")
    elseif action == "revive_player" then
        local target = data.target
        if target and tonumber(target) then
            TriggerServerEvent("cs-adminmenu:server:revivePlayer", tonumber(target))
        else
            TriggerEvent('QBCore:Notify', "Select a player", "error")
        end
    elseif action == "bring_player" then
        local target = data.target
        if target and tonumber(target) then
            TriggerServerEvent("cs-adminmenu:server:bringPlayer", tonumber(target))
        else
            TriggerEvent('QBCore:Notify', "Select a player", "error")
        end
    elseif action == "teleport_player" then
        local target = data.target
        if target and tonumber(target) then
            TriggerServerEvent("cs-adminmenu:server:teleportPlayer", tonumber(target))
        else
            TriggerEvent('QBCore:Notify', "Select a player", "error")
        end
    elseif action == "kick_player" then
        local target = data.target
        if target and tonumber(target) and data.reason then
            TriggerServerEvent("cs-adminmenu:server:kickPlayer", tonumber(target), data.reason)
        else
            TriggerEvent('QBCore:Notify', "Select a player and enter a kick reason", "error")
        end
    elseif action == "ban_player" then
        local target = data.target
        if target and tonumber(target) and data.reason and data.duration then
            TriggerServerEvent("cs-adminmenu:server:banPlayer", tonumber(target), data.reason, data.duration)
        else
            TriggerEvent('QBCore:Notify', "Select a player and enter valid ban info", "error")
        end
    elseif action == "give_money" then
        local target = data.target
        if target and tonumber(target) and data.amount and data.moneyType then
            TriggerServerEvent("cs-adminmenu:server:giveMoney", tonumber(target), data.amount, data.moneyType)
        else
            TriggerEvent('QBCore:Notify', "Invalid input for giving money", "error")
        end
    elseif action == "give_clothing_menu" then
        local target = data.target
        if target and tonumber(target) then
            TriggerServerEvent("cs-adminmenu:server:giveClothingMenu", tonumber(target))
        else
            TriggerEvent('QBCore:Notify', "Select a player", "error")
        end
    elseif action == "open_inventory" then
        local target = data.target
        if target and tonumber(target) then
            TriggerServerEvent("inventory:server:OpenInventory", tonumber(target))
        else
            TriggerEvent('QBCore:Notify', "Select a player", "error")
        end
    elseif action == "give_item" then
        local target = data.target
        if target and tonumber(target) and data.item and data.quantity then
            TriggerServerEvent("cs-adminmenu:server:giveItem", tonumber(target), data.item, data.quantity)
        else
            TriggerEvent('QBCore:Notify', "Enter a valid item and quantity", "error")
        end
    elseif action == "unban_player" then
        local banId = data.banId
        if banId and banId ~= "" then
            TriggerServerEvent("cs-adminmenu:server:unbanPlayer", banId)
        else
            TriggerEvent('QBCore:Notify', "Enter a valid ban ID", "error")
        end
    elseif action == "show_player_money" then
        local target = data.target
        if target and tonumber(target) then
            TriggerServerEvent("cs-adminmenu:server:getPlayerMoney", tonumber(target))
        else
            TriggerEvent('QBCore:Notify', "Select a player", "error")
        end
    else
        TriggerEvent('QBCore:Notify', "Unknown admin action", "error")
    end
    cb('ok')
end)

RegisterNetEvent("cs-adminmenu:client:playerList", function(players)
    SendNUIMessage({ action = "updatePlayerList", players = players })
end)

RegisterNetEvent("cs-adminmenu:client:showPlayerMoney", function(cash, bank)
    local function formatNumber(num)
        local formatted = tostring(num):reverse():gsub("(%d%d%d)", "%1,")
        formatted = formatted:reverse():gsub("^,", "")
        return formatted
    end
    SendNUIMessage({
        action = "showPlayerMoney",
        cash = formatNumber(cash),
        bank = formatNumber(bank)
    })
end)


Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if adminMenuOpen and IsControlJustReleased(0, 322) then
            CloseAdminMenu()
        end
    end
end)

RegisterNetEvent('cs-adminmenu:client:enableNoclip', function()
    noclipEnabled = true
    SetEntityVisible(PlayerPedId(), false, false)
end)

RegisterNetEvent('cs-adminmenu:client:disableNoclip', function()
    noclipEnabled = false
    SetEntityVisible(PlayerPedId(), true, false)
end)

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if noclipEnabled then
            local ped = PlayerPedId()
            local x, y, z = table.unpack(GetEntityCoords(ped, true))
            if IsControlPressed(0, 32) then x = x + 0.5 end
            if IsControlPressed(0, 33) then x = x - 0.5 end
            if IsControlPressed(0, 34) then y = y - 0.5 end
            if IsControlPressed(0, 35) then y = y + 0.5 end
            if IsControlPressed(0, 44) then z = z + 0.5 end
            if IsControlPressed(0, 48) then z = z - 0.5 end
            SetEntityCoordsNoOffset(ped, x, y, z, true, true, true)
        end
    end
end)

RegisterNetEvent("cs-adminmenu:client:bringPlayer", function(coords)
    local ped = PlayerPedId()
    SetEntityCoords(ped, coords.x, coords.y, coords.z, false, false, false, true)
    TriggerEvent('QBCore:Notify', "You have been brought by an admin", "success")
end)

RegisterNetEvent("cs-adminmenu:client:teleportPlayer", function(coords)
    local ped = PlayerPedId()
    SetEntityCoords(ped, coords.x, coords.y, coords.z, false, false, false, true)
    TriggerEvent('QBCore:Notify', "You have been teleported by an admin", "success")
end)
