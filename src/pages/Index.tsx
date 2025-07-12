
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import HomeFeed from "./HomeFeed";
import Profile from "./Profile";
import { StudyGroups } from "./StudyGroups";
import { Communities } from "./Communities";
import { Chat } from "./Chat";
import { EventCalendar } from "./EventCalendar";
import { Announcements } from "./Announcements";
import { Explore } from "./Explore";

const Index = () => {
  return (
    <Routes>
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
};

export default Index;
