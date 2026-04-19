import React from 'react'
import { useUrlTabs } from '@/shared/hooks/useUrlTabs';
import { LayoutTabs, ITabNavItems } from '@/shared/components/LayoutTabs';

export const LayoutWhiteLabelPage = ({
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
    key:  'general',
    name: 'General',
    route: ''
  },
  {
    key:  'home',
    name: 'Home',
    route: 'home'
  },
  {
    key:  'terms-conditions',
    name: 'Términos y condiciones',
    route: 'terms-conditions'
  },
  {
    key:  'privacy-policy',
    name: 'Políticas de privacidad',
    route: 'privacy-policy'
  }
]