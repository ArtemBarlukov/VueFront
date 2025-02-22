import GroupPage from "@/comp/GroupPage.vue";

const routes = [
  {
    path: "/group/:category",
    name: "GroupPage",
    component: GroupPage,
    props: true,
  },
];