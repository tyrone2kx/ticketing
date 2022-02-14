import 'bootstrap/dist/css/bootstrap.css'
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return <>
        <Header currentUser={currentUser} />
        <div className='container'>
            <Component currentUser={currentUser} {...pageProps} />
        </div>
    </>
}


AppComponent.getInitialProps = async (context) => {
    try {
        const client = buildClient(context.ctx);
        const { data } = await client.get('/api/users/currentUser')
        let pageProps = {}
        if (context.Component.getInitialProps) {
            pageProps = await context.Component.getInitialProps(context.ctx, client, data.currentUser)
        }
        return {
            pageProps,
            ...data
        }
    }
    catch (err) { }
}

export default AppComponent