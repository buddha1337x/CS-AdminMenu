-- client/fix_vehicle.lua
function FixVehicle()
    local ped = PlayerPedId()
    local veh = GetVehiclePedIsIn(ped, false)
    if veh and veh ~= 0 then
        SetVehicleFixed(veh)
        SetVehicleDeformationFixed(veh)
        TriggerEvent('QBCore:Notify', "Vehicle fixed!", "success")
    else
        TriggerEvent('QBCore:Notify', "Not in a vehicle", "error")
    end
end
