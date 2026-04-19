import { Helmet } from "react-helmet";

type Props = {
    title: string;
    element: React.ReactNode
}

export const RouteWithTitle = ({ element, title }: Props) => {
    return (
        <>
            <Helmet title={`eSIM Demo - ${title}`} />
            { element }
        </>
    )
    
}
