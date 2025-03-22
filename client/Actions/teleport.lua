-- client/teleport.lua
function TeleportToWaypoint()
    local ped = PlayerPedId()
    local blip = GetFirstBlipInfoId(8)
    if DoesBlipExist(blip) then
        local coords = GetBlipCoords(blip)
        SetEntityCoords(ped, coords.x, coords.y, coords.z, false, false, false, true)
        TriggerEvent('QBCore:Notify', "Teleported to waypoint!", "success")
    else
        TriggerEvent('QBCore:Notify', "No waypoint set!", "error")
    end
end
