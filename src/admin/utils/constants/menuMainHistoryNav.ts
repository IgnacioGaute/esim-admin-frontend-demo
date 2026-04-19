
type KeyRouteMain = 'dashboard' | 
'coupons' | 
'users' | 
'referral' | 
'transactions' | 
'marketing' | 
'white-label' |
'rulesre' |
'companies' |
'orders' | 
'rules' |
'bundles' |
'choice-pools' |
'esim-inventory'|
'esim-devices'

export const MENU_MAIN_HISTORY_NAV = (key: KeyRouteMain | KeyRouteMain[]) => typeof key ==  'string' 
? `/admin/${key}` : `/admin/${key.join('/')}`