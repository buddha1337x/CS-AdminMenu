-- client/godmode.lua
function ToggleGodMode()
    local ped = PlayerPedId()
    local current = GetPlayerInvincible(ped)
    SetPlayerInvincible(ped, not current)
    TriggerEvent('QBCore:Notify', "Godmode " .. (current and "disabled" or "enabled") .. "!", "success")
end
