import React from 'react'
import { Box, Tabs } from '@mui/material';
import { LinkTab } from './LinkTab';
import { ITabsNavigationItem } from '../interfaces/components';

export interface ITabNavItems extends ITabsNavigationItem{}

export const LayoutTabs = ({
    children,
    currentTab,
    activeTabKey,
    TABS_NAVIGATION
  } : { 
    children:   React.ReactNode,
    currentTab: number;
    activeTabKey: string,
    TABS_NAVIGATION: ITabNavItems[]
}) => {
  return (
    <Box width={'100%'}>
      <Box sx={{ border: 1, borderColor: 'divider', background: '#fff', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
        <Tabs
            value={currentTab}
            aria-label="nav tabs example"
            role="navigation"
            textColor='primary'
            variant="fullWidth"
        >
          {
            TABS_NAVIGATION.map((nav, idx) => (
              <LinkTab 
                key={idx}
                to={nav.route}
                label={nav.name}
                tab={{
                  selected: nav.key === activeTabKey,
                }}
              />
            ))
          }
        </Tabs>
      </Box>
      <Box paddingTop={3} width='100%'>
        { children }
      </Box>
    </Box>
  )
}
