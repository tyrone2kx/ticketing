import Link from 'next/link'

const Header = ({ currentUser }) => {

    const links = [
        !currentUser && {
            label: 'Sign Up',
            href: '/auth/signup'
        },
        currentUser && {
            label: 'Sign Out',
            href: 'auth/signout'
        },
        currentUser && {
            label: 'Sell Tickets',
            href: '/tickets/new'
        },
        currentUser && {
            label: 'My Orders',
            href: '/orders'
        },
        !currentUser && {
            label: 'Sign In',
            href: '/auth/signin'
        },
    ].filter(x => x).map(({ label, href }) => (
        <li className="nav-item" key={href}>
            <Link href={href}>
               <a className="nav-link"> {label} </a>
            </Link>
        </li>
    ))


    return <nav className="navbar navbar-light bg-light">
        <Link href="/">
            <a className="navbar-brand">GitTix</a>
        </Link>

        <div className="flex justify-content-end">
            <ul className="nav d-flex align-items-center">
                {currentUser ? 'Sign Out' : 'Sign In'}
            </ul>
        </div>
    </nav>
}

export default Header;