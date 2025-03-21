fx_version 'cerulean'
game 'gta5'

author 'carson - Classic Scripts'
version '1.0.0'
lua54 'yes'

ui_page 'ui/index.html'

shared_scripts {
    'shared/config.lua',
}

client_scripts {
    'client/*.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/*.lua',
}


files {
    'ui/*.*',
}

dependencies {
	'oxmysql',
}