
import Bg01Svg from '@/assets/images/backgrounds/bg-01.svg'

interface Props<T = React.CSSProperties>{
    main: T;
    card: T;
    primary: T;
}

export const stylesLayout = () : Props => ({
    main: {
        minHeight: '100vh',
        backgroundImage: `url(${Bg01Svg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        padding: '0 15px',
    },
    card: {
        margin: '0 auto',
        maxWidth: '420px',
        width: '100%',
        backgroundColor: '#fff',
        padding: '24px 15px',
        borderRadius: '8px',
        position: 'relative',
    },
    primary: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
})