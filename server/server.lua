local QBCore = exports['qb-core']:GetCoreObject()
local allowedAce = Config.AllowedAcePermission

QBCore.Commands.Add("adminmenu", "Open the admin menu", {}, false, function(source, args)
    if IsPlayerAceAllowed(source, allowedAce) then
        TriggerClientEvent("cs-adminmenu:client:openMenu", source, Config.AdminMenuTitle)
    else
        TriggerClientEvent('QBCore:Notify', source, "You do not have permission to use this command", "error")
    end
end, "admin")

RegisterNetEvent("cs-adminmenu:server:getPlayers", function()
    local src = source
    local players = {}
    for _, playerId in ipairs(GetPlayers()) do
        local Player = QBCore.Functions.GetPlayer(tonumber(playerId))
        if Player then
            local name = (Player.PlayerData.charinfo and (Player.PlayerData.charinfo.firstname .. " " .. Player.PlayerData.charinfo.lastname)) or ("ID: " .. playerId)
            table.insert(players, { id = playerId, name = name })
        end
    end
    TriggerClientEvent("cs-adminmenu:client:playerList", src, players)
end)

RegisterNetEvent("cs-adminmenu:server:revivePlayer", function(target)
    local Player = QBCore.Functions.GetPlayer(target)
    if Player then
        TriggerClientEvent("hospital:client:Revive", target)
        TriggerClientEvent('QBCore:Notify', target, "You have been revived by an admin", "success")
    end
end)

RegisterNetEvent("cs-adminmenu:server:bringPlayer", function(target)
    local src = source
    local adminPed = GetPlayerPed(src)
    local adminCoords = GetEntityCoords(adminPed)
    TriggerClientEvent("cs-adminmenu:client:bringPlayer", target, adminCoords)
end)

RegisterNetEvent("cs-adminmenu:server:teleportPlayer", function(target)
    local src = source
    local adminPed = GetPlayerPed(src)
    local adminCoords = GetEntityCoords(adminPed)
    TriggerClientEvent("cs-adminmenu:client:teleportPlayer", target, adminCoords)
end)

RegisterNetEvent("cs-adminmenu:server:kickPlayer", function(target, reason)
    local Player = QBCore.Functions.GetPlayer(target)
    if Player then
        DropPlayer(target, "You were kicked by an admin for: " .. (reason or "No reason provided"))
    end
end)

RegisterNetEvent("cs-adminmenu:server:banPlayer", function(target, reason, duration)
    local src = source
    local adminPlayer = QBCore.Functions.GetPlayer(src)
    local targetPlayer = QBCore.Functions.GetPlayer(tonumber(target))
    if targetPlayer then
        local adminName = adminPlayer and (adminPlayer.PlayerData.charinfo.firstname .. " " .. adminPlayer.PlayerData.charinfo.lastname) or ("ID: " .. src)
        local targetName = targetPlayer.PlayerData.charinfo and (targetPlayer.PlayerData.charinfo.firstname .. " " .. targetPlayer.PlayerData.charinfo.lastname) or ("ID: " .. target)
        local identifiers = table.concat(GetPlayerIdentifiers(tonumber(target)), ",")
        local expires_at
        if duration == "Permanent" then
            expires_at = "2038-01-19 03:14:07"
        else
            local days = tonumber(duration:match("(%d+)"))
            if days then
                expires_at = os.date("%Y-%m-%d %H:%M:%S", os.time() + days * 24 * 60 * 60)
            else
                expires_at = os.date("%Y-%m-%d %H:%M:%S", os.time() + 24 * 60 * 60)
            end
        end
        MySQL.Async.execute('INSERT INTO CS_Admin_Bans (player_name, identifiers, reason, duration, expires_at, admin_name) VALUES (?, ?, ?, ?, ?, ?)', {
            GetPlayerName(target),
            identifiers,
            reason,
            duration,
            expires_at,
            GetPlayerName(src)
        }, function(rowsChanged)
            DropPlayer(target, "You have been banned by " .. adminName .. " for: " .. reason .. " (" .. duration .. ")")
        end)
    else
        TriggerClientEvent('QBCore:Notify', src, "Player not found", "error")
    end
end)

RegisterNetEvent("cs-adminmenu:server:giveMoney", function(target, amount, moneyType)
    local Player = QBCore.Functions.GetPlayer(target)
    if Player then
        local amt = tonumber(amount)
        if amt and amt > 0 then
            Player.Functions.AddMoney(moneyType, amt, "Admin Money Given")
            TriggerClientEvent('QBCore:Notify', target, "You received $" .. amt .. " in " .. moneyType, "success")
        else
            TriggerClientEvent('QBCore:Notify', source, "Invalid amount", "error")
        end
    else
        TriggerClientEvent('QBCore:Notify', source, "Player not found", "error")
    end
end)

RegisterNetEvent("cs-adminmenu:server:unbanPlayer", function(banId)
    MySQL.Async.execute('DELETE FROM CS_Admin_Bans WHERE id = ?', { banId }, function(affectedRows)
         if affectedRows > 0 then
            TriggerClientEvent('QBCore:Notify', source, "Ban removed successfully", "success")
         else
            TriggerClientEvent('QBCore:Notify', source, "Ban ID not found", "error")
         end
    end)
end)

-- Player connecting ban check
AddEventHandler('playerConnecting', function(name, setKickReason, deferrals)
    local src = source
    deferrals.defer()
    local identifiers = GetPlayerIdentifiers(src)
    local banFound = nil
    local processed = 0
    local total = #identifiers
    if total == 0 then
        deferrals.done()
        return
    end
    for _, id in ipairs(identifiers) do
        MySQL.Async.fetchAll('SELECT * FROM CS_Admin_Bans WHERE identifiers LIKE ? AND expires_at > NOW()', { "%" .. id .. "%" }, function(result)
            processed = processed + 1
            if not banFound and result and result[1] then
                banFound = result[1]
            end
            if processed >= total then
                if banFound then
                    local reason = banFound.reason or "No reason provided"
                    local duration = banFound.duration or "N/A"
                    local bannedAt = banFound.timestamp or ""
                    local bannedAtReadable = bannedAt
                    if tonumber(bannedAt) then
                        bannedAtReadable = os.date("%Y-%m-%d %H:%M:%S", math.floor(tonumber(bannedAt) / 1000))
                    end
                    deferrals.done("You are banned from this server.\nBan ID: " .. banFound.id .. "\nReason: " .. reason .. "\nBan Duration: " .. duration .. "\nBanned At: " .. bannedAtReadable)
                else
                    deferrals.done()
                end
            end
        end)
    end
end)
