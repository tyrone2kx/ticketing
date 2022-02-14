import { Router } from 'next/router';
import { useState, useEffect } from 'react';
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../hooks/useRequest';


const OrderShow = ({ order, currentUser }) => {

    const [timeLeft, setTimeLeft] = useState(0);

    const { doRequest, errors } = useRequest({
        url: "/api/payments",
        method: "post",
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders')
    });

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000))
        }
        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId)
        };
    }, [order]);

    if (timeLeft < 0) {
        return <div>Order Expired.</div>
    }


    return (
        <div>
            <h1>New Order</h1>
            <p>Time left to pay: {timeLeft} seconds.</p>

            <StripeCheckout
                token={({ id }) => { doRequest({ token: id }) }}
                stripeKey="pk_test_51KQFTWCnBQFhAut3DVPW5Mqvr0KOSSGTcD0aEHxRQvYsN6zxkIF9T1OdJ7bfo1nLyNxm6gp68WmRpVmnorBYq79g00OBL5p2ru"
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />

            {errors}
        </div>
    )
}


OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);
    return { order: data }
}

export default OrderShow;