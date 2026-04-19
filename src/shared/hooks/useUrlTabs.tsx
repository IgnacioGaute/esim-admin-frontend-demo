import { useMemo } from 'react'
import { useLocation } from 'react-router-dom';
import { ITabsNavigationItem } from '../interfaces/components';


export const useUrlTabs = (tabsNavigation: ITabsNavigationItem[]) => {
    const { pathname } = useLocation();

    const indexCurrentTab = useMemo(() => {
        let indexCurrent = 0;

        const tabsDifWhite = tabsNavigation.filter(tab => tab.route !== '');

        if( tabsDifWhite ){
            tabsDifWhite.some(({ route, key }) => {
                if( pathname.includes(route) ){
                    indexCurrent = tabsNavigation.findIndex(tab => tab.key == key);
                    return;
                }
            })
        }

        return indexCurrent;
    }, [pathname]);
    
    const activeTabKey = useMemo(() => {
        return tabsNavigation[indexCurrentTab].key;
    }, [indexCurrentTab])
      
    return {
        indexCurrentTab,
        activeTabKey
    }
}
