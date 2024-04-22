class ComponentService {

    constructor(httpClient, serverURL) {
        this.httpClient = httpClient;
        this.serverURL = serverURL;
    }

    /* ---------------------------------------------------
 This functionality is used to insert the  list of dragged component in sqlite database.
----------------------------------------------------- */
    async createComponent(componentName, projectId, backgroundColor, textColor,borderColor,fontFamily, typoColor,cardbodyColor) {

        const componentDetails = {
            "componentName": componentName,
            "projectId": projectId,
            "componentBackgroundColor": backgroundColor,
            "componentTextColor": textColor,
            "componentBorderColor":borderColor,
            "componentFontFamily":fontFamily,
            "componentTypoColor": typoColor,
            "componentBodyColor":cardbodyColor
        }
        try {
            const response = await this.httpClient.post(`${this.serverURL}/createComponent`, componentDetails);
            return response;
        }
        catch (err) {
            console.error('An error occurred while inserting a component in sqlite db..!', err);
        }
    }
    /* ---------------------------------------------------
     This functionality is used to retrive list of component from sqlite db based on the project ID.
    ----------------------------------------------------- */
    async getComponents(projectid) {
        try {
            const response = await this.httpClient.get(`${this.serverURL}/getComponents/${projectid}`);
            return response.json();
        }
        catch (err) {
            console.error('An error occurred while fetching project details...!', err);
        }
    }


    /* ---------------------------------------------------
This functionality is used to delete component name based on projectId from sqlite db  based on project id.
----------------------------------------------------- */
    async deleteComponent(id, ComponentName) {
        try {
            const response = await this.httpClient.delete(`${this.serverURL}/deleteComponent/${id},${ComponentName}`);
            return response;
        }
        catch (err) {
            console.error('An error occurred while deleting a project..!', err);
        }
    }

}
export default ComponentService;