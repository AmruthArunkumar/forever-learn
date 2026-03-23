export const dashboardDailyPage = "daily overview";
export const dashboardCardsPage = "flashcard sets";
export const dashboardProgressPage = "your progress";

export function titleCase(str: string) {
    var splitStr = str.toLowerCase().split(" ");
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
}
