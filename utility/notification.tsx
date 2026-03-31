import { showNotification } from "@mantine/notifications";
import CancelIcon from "@mui/icons-material/Cancel";

export const showErrorNotification = (msg: string) => {
    showNotification({
        title: "Something went wrong",
        message: msg,
        color: "red",
        radius: "xs",
        style: {
            maxWidth: "40vw",
            marginLeft: "auto",
            marginRight: "auto",
        },
        icon: <CancelIcon />
    });
}