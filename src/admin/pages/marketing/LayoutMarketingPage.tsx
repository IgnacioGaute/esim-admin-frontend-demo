
import React from 'react'
import { useUrlTabs } from '@/shared/hooks/useUrlTabs';
import { LayoutTabs, ITabNavItems } from '@/shared/components/LayoutTabs';

export const LayoutMarketingPage = ({
    children,
} : { children: React.ReactNode }) => {
    const { activeTabKey, indexCurrentTab } = useUrlTabs(TABS_NAVIGATION);

    return (
        <LayoutTabs
            currentTab={indexCurrentTab}
            activeTabKey={activeTabKey}
            TABS_NAVIGATION={TABS_NAVIGATION}
        >
            {children}
        </LayoutTabs>
    )
}


const TABS_NAVIGATION: ITabNavItems[] = [
    {
        key:  'notificaction-push',
        name: 'Notificaciones Push',
        route: ''
    }
]