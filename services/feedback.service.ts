import { AxiosResponse } from "axios";
import { post, get } from "@/utils/axios";
import { CreateFeedbackRequest, CreateFeedbackResponse, FeedbackListResponse } from "@/types";

export const FEEDBACK_ENDPOINT = {
  CREATE_FEEDBACK: "/feedback/create-multiple",
  GET_FEEDBACK_BY_PRODUCTID: "/feedback/productid/{id}"
};

class FeedbackService {
  createFeedback(
    payload: CreateFeedbackRequest[]
  ): Promise<AxiosResponse<CreateFeedbackResponse>> {
    // Bao gói mảng payload vào trong một đối tượng có key "feedbacks"
    const data = { feedbacks: payload };
    console.log("Payload to submit:", data);
    return post(FEEDBACK_ENDPOINT.CREATE_FEEDBACK, data);
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
