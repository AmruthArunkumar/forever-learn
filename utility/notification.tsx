import { showNotification, updateNotification } from "@mantine/notifications";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export const showErrorNotification = (msg: string, id: string = "", update: boolean = false) => {
    const notification = {
        id: id,
        title: "Something went wrong!",
        message: msg,
        color: "red",
        radius: "xs",
        style: {
            position: "fixed" as const,
            left: "50%",
            bottom: "20px",
            transform: "translateX(-50%)",
            width: "calc(100% - 40px)",
            maxWidth: "400px",
            zIndex: 1000
        },
        icon: <CancelIcon />,
        loading: false,
    };
    update ? updateNotification(notification) : showNotification(notification);
};

export const showSuccessNotification = (msg: string, id: string = "", update: boolean = false) => {
    const notification = {
        id: id,
        title: "Success!",
        message: msg,
        color: "green",
        radius: "xs",
        style: {
            position: "fixed" as const,
            left: "50%",
            bottom: "20px",
            transform: "translateX(-50%)",
            width: "calc(100% - 40px)",
            maxWidth: "400px",
            zIndex: 1000
        },
        icon: <CheckCircleIcon />,
        loading: false,
    };
    update ? updateNotification(notification) : showNotification(notification);
};

export const showLoadingNotification = (msg: string, id: string = "", update: boolean = false) => {
    const notification = {
        id: id,
        title: "Please Wait...",
        message: msg,
        color: "blue",
        radius: "xs",
        style: {
            position: "fixed" as const,
            left: "50%",
            bottom: "20px",
            transform: "translateX(-50%)",
            width: "calc(100% - 40px)",
            maxWidth: "400px",
            zIndex: 1000
        },
        loading: true,
    };
    update ? updateNotification(notification) : showNotification(notification);
};
