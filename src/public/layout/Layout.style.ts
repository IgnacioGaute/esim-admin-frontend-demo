interface Props<T = React.CSSProperties> {
  main: T;
  card: T;
  primary: T;
}

export const stylesLayout = (): Props => ({
  main: {
    minHeight: '100vh',
    background: '#0A0A0F',
    padding: '0 15px',
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    margin: '0 auto',
    maxWidth: '440px',
    width: '100%',
    backgroundColor: 'rgba(15, 15, 25, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: '40px 32px',
    borderRadius: '12px',
    position: 'relative',
    zIndex: 10,
  },
  primary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
