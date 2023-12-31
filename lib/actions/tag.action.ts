"use server";

import User from "@/databases/user.model";
import { connectToDatabase } from "./mongoose";
import { FilterQuery } from "mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";
import Tag, { ITag } from "@/databases/tag.model";
import Question from "@/databases/question.modal";

export async function getTopInteractedTagsParams({
  userId,
}: GetTopInteractedTagsParams) {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found");
    }
    //find interactions of user group by tagId and sort by count
    return [
      { _id: "1", tag: "tag1", count: 1 },
      { _id: "2", tag: "tag2", count: 2 },
      { _id: "3", tag: "tag3", count: 3 },
    ];
  } catch (error) {
    console.error(` Error in getUserCreatedTags: ${error}`);
  }
}

// get all tags

export async function getAllTags(params: GetAllTagsParams) {
  try {
    await connectToDatabase();
    const { searchQuery, filter, page = 1, pageSize = 20 } = params;
    const query: FilterQuery<typeof Tag> = {};
    const skipAmount = (page - 1) * pageSize;
    if (searchQuery) {
      query.$or = [{ name: { $regex: new RegExp(searchQuery, "i") } }];
    }
    let sortOptions = {};
    switch (filter) {
      case "popular":
        sortOptions = { questions: -1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "name":
        sortOptions = { name: 1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;
      default:
        break;
    }
    const countTags = await Tag.countDocuments(query);
    const tags = await Tag.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);
    const isNext = countTags > skipAmount + tags.length;
    return { tags, isNext };
  } catch (error) {
    console.error(` Error in getUserCreatedTags: ${error}`);
  }
}
// get questions by tagId
export async function getQuestionByTagId(params: GetQuestionsByTagIdParams) {
  try {
    await connectToDatabase();
    const { tagId, page = 1, pageSize = 10, searchQuery } = params;
    const tagFilter: FilterQuery<ITag> = { _id: tagId };
    const skipAmount = (page - 1) * pageSize;
    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } }
        : {},
      options: {
        sort: { createdAt: -1 },
        skip: skipAmount,
        limit: pageSize + 1,
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });
    if (!tag) throw new Error("Tag not found");
    const isNext = tag.questions.length > pageSize;
    const questions = tag.questions;
    return { tagTitle: tag.name, questions, isNext };
  } catch (error) {
    console.error(` Error in getQuestionByTagId: ${error}`);
  }
}

//get Popular tags
export async function getPopularTags() {
  try {
    await connectToDatabase();
    const popularTags = await Tag.aggregate([
      { $project: { name: 1, numberofQuestions: { $size: "$questions" } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]);

    return popularTags;
  } catch (error) {
    console.error(` Error in getPopularTags: ${error}`);
  }
}
