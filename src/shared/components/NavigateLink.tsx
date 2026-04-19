import { ReactNode } from "react";
import { Link, LinkProps } from "react-router-dom";
import { Link as LinkUI, LinkProps as LinkPropsUI } from "@mui/material";


interface Props extends LinkProps {
    uiLink?: LinkPropsUI;
    children?: ReactNode;
}

export const NavigateLink = ({
    uiLink,
    children,
    ...props
}:Props) => (
    <Link {...props} 
        style={{
            textUnderlineOffset: 'none',
            textDecoration: 'none'
        }}
    >
     <LinkUI {...uiLink}>
        { children }
     </LinkUI>
    </Link>
)

