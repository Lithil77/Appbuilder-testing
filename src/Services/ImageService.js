class ImageService {

    constructor(httpClient, serverURL) {
        this.httpClient = httpClient;
        this.serverURL = serverURL;
    }

    /* ---------------------------------------------------
 This functionality is used to insert the  list of dragged component in sqlite database.
----------------------------------------------------- */
    async createImage(obj) {
        console.log("getting data", obj.image);
        const imageDetails = {
            "image": obj.image,
            "projectId": obj.projectId
        }
        console.log("imageDetails", imageDetails);
        try {
            const response = await this.httpClient.post(`${this.serverURL}/createImage`, imageDetails);
            return response;
        }
        catch (err) {
            console.error('An error occurred while inserting a component in sqlite db..!', err);
        }
    }

    async getImageByProjectId(projectId) {

        try {
            const response = await this.httpClient.get(`${this.serverURL}/getImageByProjectId/${projectId}`);
            return response.json();
        }
        catch (err) {
            console.error('An error occurred while fetching project details...!', err);
        }
    }
}
export default ImageService;