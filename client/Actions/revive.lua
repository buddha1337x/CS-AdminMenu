-- client/revive.lua
function HandleRevive()
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    NetworkResurrectLocalPlayer(coords, true, true, false)
    SetEntityHealth(ped, 200)
    TriggerEvent('QBCore:Notify', "You revived yourself!", "success")
end
