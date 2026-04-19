import React from 'react'
import { colors, Tab } from '@mui/material';
import { Link, LinkProps, Navigate } from "react-router-dom";

export function samePageLinkNavigation(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) {
    if (
      event.defaultPrevented ||
      event.button !== 0 || // ignore everything but left-click
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.shiftKey
    ) {
      return false;
    }
    return true;
}

interface LinkTabProps extends LinkProps{
    label?: string;
    tab?: {
        href?: string;
        selected?: boolean;
    }
}

export const LinkTab = (props: LinkTabProps) => {
  return (

        <Tab
            component={(propsTab) => <Link 
                {...propsTab} 
                {...props}
                style={{
                  color: props?.tab?.selected ? '#1C3680' : '#222'
                }}
            >{propsTab?.children}</Link>}
            onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {console.log("aqui x2")}}
            aria-current={props?.tab?.selected}
            label={props?.label}
            {...props?.tab}
            sx={{
                textTransform: 'capitalize',
            }}
        />
   
   
  )
}
