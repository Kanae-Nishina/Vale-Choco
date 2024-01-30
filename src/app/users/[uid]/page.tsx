"use client";

import Loading from "@/app/loading";
import {
  getPostsRangeByFavorite,
  getPostsRangeByUser,
} from "@/components/GetPostsRange";
import Pagination from "@/components/Pagination";
import PostCard from "@/components/PostCard";
import { PostData, UserData } from "@/types";
import { getUserByUid } from "@/utils/supabaseClient";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";

const MyPage = ({ params }: { params: { uid: string } }) => {
  const searchParams = useSearchParams();
  const { uid } = params;
  const [user, setUser] = useState({} as UserData);
  const [posts, setPosts] = useState([] as PostData[]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams?.get("page")) || 1
  );
  const [pageTabsCount, setPageTabsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isMobile = window.innerWidth <= 768;
  const isTablet = 769 < window.innerWidth && window.innerWidth < 1024;
  const isPc = 1024 <= window.innerWidth;
  const [isResponsiveClass, setIsResponsiveClass] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const decodedUid = decodeURIComponent(uid);
      const userData = await getUserByUid(decodedUid);
      if (userData) {
        setUser(userData);
        setLoading(false);
      }
      const result = await getPostsRangeByUser(1, decodedUid);
      if (result) {
        setPosts(result.posts);
        setPageTabsCount(result.pageTabsCount);
      }
    };
    fetchData();
    if (isMobile) setIsResponsiveClass("flex flex-col gap-4");
    else if (isTablet) setIsResponsiveClass("grid grid-cols-2 gap-4");
    else if (isPc) setIsResponsiveClass("grid grid-cols-3 gap-4");
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      if (isFavorite) {
        const result = await getPostsRangeByFavorite(currentPage, user.id);
        if (result) {
          setPosts(result.posts);
          setPageTabsCount(result.pageTabsCount);
          setLoading(false);
        }
      } else {
        await defaultSetPosts();
      }
    };
    fetchData();
  }, [currentPage, isFavorite]);

  const defaultSetPosts = async () => {
    const decodedUid = decodeURIComponent(uid);
    const result = await getPostsRangeByUser(currentPage, decodedUid);
    if (result) {
      setPosts(result.posts);
      setPageTabsCount(result.pageTabsCount);
      setLoading(false);
    }
    return result;
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    setLoading(true);
  };

  return (
    <article>
      {loading ? (
        <Loading />
      ) : (
        <>
          <h2 className="text-center text-2xl m-5">
            {user.displayName}さんのページ
          </h2>
          <div className="text-end">
            <Button
              content="表示名を変更する"
              onClickEvent={() => {
                router.push(`/users/${uid}/edit`);
              }}
            />
          </div>
          <div>
            <div className="flex">
              {isFavorite ? (
                <>
                  <button
                    className="m-3 text-xl  p-2 rounded-2xl hover:bg-slate-200 transition-all"
                    onClick={() => handleFavorite()}
                  >
                    投稿一覧
                  </button>
                  <button
                    className="m-3 text-xl rounded-2xl p-2 bg-slate-200"
                    onClick={() => handleFavorite()}
                  >
                    いいね一覧
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="m-3 text-xl bg-slate-200 p-2 rounded-2xl"
                    onClick={() => handleFavorite()}
                  >
                    投稿一覧
                  </button>
                  <button
                    className="m-3 text-xl rounded-2xl p-2 hover:bg-slate-200 transition-all"
                    onClick={() => handleFavorite()}
                  >
                    いいね一覧
                  </button>
                </>
              )}
            </div>
            <div className={isResponsiveClass}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
          <Pagination
            pageNumber={currentPage}
            totalCount={pageTabsCount}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}
    </article>
  );
};

export default MyPage;
