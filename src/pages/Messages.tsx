import { Helmet } from "react-helmet";
import { MessagingPage } from "@/components/messaging/MessagingPage";

const Messages = () => {
  return (
    <>
      <Helmet>
        <title>Messages | OpenTeknologies</title>
        <meta name="description" content="Communicate with artisans and customers about orders and quotes" />
      </Helmet>
      <MessagingPage />
    </>
  );
};

export default Messages;