"use client";

import React, { useCallback, useEffect, useState } from "react";
import styles from "@styles/admin.module.css";
import BackButton from "@components/UI/backButton";
import { useRouter } from "next/navigation";
import { useAccount } from "@starknet-react/core";

import { QuestDocument } from "../../../types/backTypes";
import { AdminService } from "@services/authService";
import { QuestDefault } from "@constants/common";
import Button from "@components/UI/button";
import Quest from "@components/admin/questCard";
import { useNotification } from "@context/NotificationProvider";
import { getExpireTimeFromJwt, getUserFromJwt } from "@utils/jwt";
import homePagestyles from "@styles/Home.module.css";
import { a11yProps } from "@components/UI/tabs/a11y";
import { CustomTabPanel } from "@components/UI/tabs/customTab";
import { Tab, Tabs } from "@mui/material";
import Loading from "@app/loading";

export default function Page() {
  const router = useRouter();
  const { address } = useAccount();
  const [loading, setLoading] = useState<boolean>(true);
  const { showNotification } = useNotification();
  const [user, setUser] = useState<string>("");
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [quests, setQuests] = useState<QuestDocument[]>([QuestDefault]);

  useEffect(() => {
    const tokenExpiryTime = getExpireTimeFromJwt();
    if (!tokenExpiryTime || tokenExpiryTime < new Date().getTime()) {
      router.push("/admin");
    }
  }, [router]);

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminService.getQuests();
      setQuests(res);
    } catch (error) {
      showNotification("Error while fetching quests", "error");
      console.error("Error fetching quests", error);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const handleCreateQuest = useCallback(() => {
    router.push("/admin/quests/create");
  }, [router]);

  useEffect(() => {
    const currentUser = getUserFromJwt();
    if (currentUser) {
      setUser(currentUser === "super_user" ? "Admin" : currentUser);
      fetchQuests();
    }
  }, [fetchQuests, address]);

  const handleChangeTab = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setTabIndex(newValue);
    },
    []
  );

  const deleteQuest = useCallback(
    async (questId: string) => {
      if (!questId || typeof questId !== "string") {
        showNotification("Invalid quest ID", "error");
        return;
      }

      if (!window.confirm("Are you sure you want to delete this quest? This action cannot be undone.")) {
        return;
      }

      setLoading(true);
      try {
        const response = await AdminService.deleteQuest(questId);
        if (!response.success) {
          throw new Error("Failed to delete quest");
        }

        setQuests((prevQuests) => prevQuests.filter((quest) => quest.id !== questId));
        showNotification("Quest deleted successfully", "success");
      } catch (error) {
        showNotification("Error deleting quest", "error");
        console.error("Error deleting quest", error);
      } finally {
        setLoading(false);
      }
    },
    [showNotification]
  );

  return (
    <div className="flex flex-col w-full pt-28 g-8">
      <div className={styles.backButton}>
        <BackButton onClick={() => router.back()} />
      </div>
      <div className={styles.screenContainer}>
        <div className={styles.questsBanner}>
          <div className="text-center sm:text-left">
            <p>{user}</p>
            <p className={styles.questListHeading}>Your quests</p>
            <p>{quests.length} quests</p>
          </div>
          <div>
            <Button onClick={handleCreateQuest}>
              <p>Create new quest</p>
            </Button>
          </div>
        </div>
        <Loading isLoading={loading} loadingType="skeleton">
          <section className={homePagestyles.section}>
            <div className="w-full">
              <Tabs
                style={{ borderBottom: "0.5px solid rgba(224, 224, 224, 0.3)" }}
                className="pb-4"
                value={tabIndex}
                onChange={handleChangeTab}
                aria-label="quests and collections tabs"
                indicatorColor="secondary"
              >
                <Tab
                  disableRipple
                  sx={{
                    borderRadius: "10px",
                    padding: "0px 12px",
                    textTransform: "none",
                    fontWeight: "600",
                    fontSize: "12px",
                    fontFamily: "Sora",
                    minHeight: "32px",
                  }}
                  label="Enabled"
                  {...a11yProps(0)}
                />
                <Tab
                  disableRipple
                  sx={{
                    borderRadius: "10px",
                    padding: "0px 12px",
                    textTransform: "none",
                    fontWeight: "600",
                    fontSize: "12px",
                    fontFamily: "Sora",
                    minHeight: "32px",
                  }}
                  label="Disabled"
                  {...a11yProps(1)}
                />
              </Tabs>

              <CustomTabPanel value={tabIndex} index={0}>
                <div className="flex flex-wrap gap-10 justify-center lg:justify-start">
                  {quests.map(
                    (quest) =>
                      !quest.disabled && (
                        <div key={quest.id} className="quest-item">
                          <Quest
                            title={quest.title_card}
                            onClick={() => router.push(`/admin/quests/dashboard/${quest.id}`)}
                            imgSrc={quest.img_card}
                            reward="Active"
                          />
                          <Button onClick={() => deleteQuest(quest.id)}>
                            <p>Delete Quest</p>
                          </Button>
                        </div>
                      )
                  )}
                </div>
              </CustomTabPanel>

              <CustomTabPanel value={tabIndex} index={1}>
                <div className="flex flex-wrap gap-10 justify-center lg:justify-start">
                  {quests.map(
                    (quest) =>
                      quest.disabled && (
                        <div key={quest.id} className="quest-item">
                          <Quest
                            title={quest.title_card}
                            onClick={() => router.push(`/admin/quests/dashboard/${quest.id}`)}
                            imgSrc={quest.img_card}
                            reward="Disabled"
                          />
                          <Button onClick={() => deleteQuest(quest.id)}>
                            <p>Delete Quest</p>
                          </Button>
                        </div>
                      )
                  )}
                </div>
              </CustomTabPanel>
            </div>
          </section>
        </Loading>
      </div>
    </div>
  );
}
