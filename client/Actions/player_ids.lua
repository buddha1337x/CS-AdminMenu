-- player_ids.lua
QBCore = exports['qb-core']:GetCoreObject()
local ShowBlips = false
local ShowNames = false
local NetCheck1 = false
local NetCheck2 = false

CreateThread(function()
    while true do
        Wait(1000)
        if NetCheck1 or NetCheck2 then
            TriggerServerEvent('qb-admin:server:GetPlayersForBlips')
        end
    end
end)

RegisterNetEvent('qb-admin:client:toggleBlips', function()
    QBCore.Functions.TriggerCallback('qb-admin:isAdmin', function(isAdmin)
        if not isAdmin then return end
        if not ShowBlips then
            ShowBlips = true
            NetCheck1 = true
            TriggerEvent('QBCore:Notify', "Blips activated", "success")
        else
            ShowBlips = false
            TriggerEvent('QBCore:Notify', "Blips deactivated", "error")
        end
    end)
end)

RegisterNetEvent('qb-admin:client:toggleNames', function()
    QBCore.Functions.TriggerCallback('qb-admin:isAdmin', function(isAdmin)
        if not isAdmin then return end
        if not ShowNames then
            ShowNames = true
            NetCheck2 = true
            TriggerEvent('QBCore:Notify', "Names activated", "success")
        else
            ShowNames = false
            TriggerEvent('QBCore:Notify', "Names deactivated", "error")
        end
    end)
end)

RegisterNetEvent('qb-admin:client:Show', function(players)
    QBCore.Functions.TriggerCallback('qb-admin:isAdmin', function(isAdmin)
        if not isAdmin then return end
        for _, player in pairs(players) do
            local playeridx = GetPlayerFromServerId(player.id)
            local ped = GetPlayerPed(playeridx)
            local blip = GetBlipFromEntity(ped)
            local name = 'ID: ' .. player.id .. ' | ' .. player.name

            local Tag = CreateFakeMpGamerTag(ped, name, false, false, '', false)
            SetMpGamerTagAlpha(Tag, 0, 255)
            SetMpGamerTagAlpha(Tag, 2, 255)
            SetMpGamerTagAlpha(Tag, 4, 255)
            SetMpGamerTagAlpha(Tag, 6, 255)
            SetMpGamerTagHealthBarColour(Tag, 25)

            if ShowNames then
                SetMpGamerTagVisibility(Tag, 0, true)
                SetMpGamerTagVisibility(Tag, 2, true)
                if NetworkIsPlayerTalking(playeridx) then
                    SetMpGamerTagVisibility(Tag, 4, true)
                else
                    SetMpGamerTagVisibility(Tag, 4, false)
                end
                if GetPlayerInvincible(playeridx) then
                    SetMpGamerTagVisibility(Tag, 6, true)
                else
                    SetMpGamerTagVisibility(Tag, 6, false)
                end
            else
                SetMpGamerTagVisibility(Tag, 0, false)
                SetMpGamerTagVisibility(Tag, 2, false)
                SetMpGamerTagVisibility(Tag, 4, false)
                SetMpGamerTagVisibility(Tag, 6, false)
                RemoveMpGamerTag(Tag)
                NetCheck2 = false
            end

            if ShowBlips then
                if not DoesBlipExist(blip) then
                    blip = AddBlipForEntity(ped)
                    SetBlipSprite(blip, 1)
                    ShowHeadingIndicatorOnBlip(blip, true)
                else
                    -- (Your blip logic for vehicles and on foot)
                end
            else
                RemoveBlip(blip)
                NetCheck1 = false
            end
        end
    end)
end)
