import { AxiosResponse } from "axios";
import { postMultipart, get } from "@/utils/axios";
import { CreateFeedbackRequest, CreateFeedbackResponse, FeedbackListResponse } from "@/types";

export const FEEDBACK_ENDPOINT = {
  CREATE_FEEDBACK: "/feedback/create-multiple",
  GET_FEEDBACK_BY_PRODUCTID: "/feedback/productid/{id}"
};

class FeedbackService {
  createFeedback(
    payload: CreateFeedbackRequest[] | FormData
  ): Promise<AxiosResponse<CreateFeedbackResponse>> {
    let formData: FormData;

    if (payload instanceof FormData) {
      formData = payload;
    } else {
      formData = new FormData();
      payload.forEach((fb, idx) => {
        if (fb.orderDetailId != null) {
          formData.append(`feedbacks[${idx}].orderDetailId`, fb.orderDetailId.toString());
        }
        formData.append(`feedbacks[${idx}].accountId`, fb.accountId.toString());
        formData.append(`feedbacks[${idx}].productId`, fb.productId.toString());

        if (fb.Title) {
          formData.append(`feedbacks[${idx}].Title`, fb.Title);
        }
        if (fb.rating != null) {
          formData.append(`feedbacks[${idx}].rating`, fb.rating.toString());
        }
        if (fb.comment) {
          formData.append(`feedbacks[${idx}].comment`, fb.comment);
        }
        if (fb.createdDate) {
          formData.append(`feedbacks[${idx}].createdDate`, fb.createdDate);
        }
        if (fb.imageFile) {
          formData.append(`feedbacks[${idx}].imageFile`, fb.imageFile);
        }
      });
    }

    // Debug
    console.log("CreateFeedback FormData entries:", Array.from(formData.entries()));
    return postMultipart(FEEDBACK_ENDPOINT.CREATE_FEEDBACK, formData);
  }
  getFeedbackByProductId(
    productId: number,
    pageIndex: number = 1,
    pageSize: number = 5
  ): Promise<AxiosResponse<FeedbackListResponse>> {
    // Thay thế {id} trong endpoint bằng productId
    const url = FEEDBACK_ENDPOINT.GET_FEEDBACK_BY_PRODUCTID.replace("{id}", String(productId))
      + `?page-index=${pageIndex}&page-size=${pageSize}`;
    return get(url);
  }
}

const feedbackService = new FeedbackService();
export default feedbackService;
