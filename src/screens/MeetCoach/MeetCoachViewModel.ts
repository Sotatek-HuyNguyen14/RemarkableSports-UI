/* eslint-disable no-return-assign */
import { observable, action, makeAutoObservable } from "mobx";

class MeetCoachViewModel {
  constructor() {
    makeAutoObservable(this);
  }

  @observable filterOptions = null;

  findCoachLabel = "Find coach";

  @observable isMeetUpModalVisible = false;

  @observable sections = [
    {
      value: "coaching",
      label: "Coaching",
      isActive: true,
    },
    {
      value: "course",
      label: "Course",
      isActive: false,
    },
    {
      value: "event",
      label: "Event",
      isActive: false,
    },
  ];

  @observable coachLists = [
    {
      name: "Mayan Lee",
      location: "Central",
      rate: "300-780 hkd/hr",
      date: "03-07-2022",
      time: "7:00AM - 7:00PM",
    },
  ];

  @action.bound
  setSection = (value: any) => {
    this.filterOptions = value;
  };

  @action.bound
  setSections = (sections: any) => [(this.sections = sections)];

  @action.bound
  setMeetUpModalVisible = (value: any) => {
    this.isMeetUpModalVisible = value;
  };
}

export default MeetCoachViewModel;
