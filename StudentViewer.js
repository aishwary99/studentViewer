import React from "react";
import Style from "./css/Style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUsers,
  faArrowCircleLeft,
  faArrowCircleRight,
  faComment,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
const studentsImages=require.context("../students");

//GetStudents API is responsible for fetching the details of students placed in a particular month of year
const GetStudents = (datePattern) => {
  var promise = new Promise((resolve, reject) => {
    fetch(`/getStudents?date=${datePattern}`)
      .then((response) => {
        if (!response.ok) throw Error("Internal Server Error : 500");
        else return response.json();
      })
      .then((response) => {
        resolve(response.students);
      })
      .catch((exception) => {
        reject(exception);
      });
  });
  return promise;
};

//GetTimeline API is responsible for fetching all the details related to available timelines from db
const GetTimeline = () => {
  var promise = new Promise((resolve, reject) => {
    fetch("/getPlacementTimelines")
      .then((response) => {
        if (!response.ok) {
          throw Error("Internal Server Error : 500");
        } else return response.json();
      })
      .then((response) => {
        resolve(response.timelines);
      })
      .catch((exception) => {
        reject(exception);
      });
  });
  return promise;
};

const AppExample8 = () => {
  const [timelines, setTimelines] = React.useState([]);
  const [selectedTimeline, setSelectedTimeline] = React.useState("");
  const [students,setStudents]=React.useState([]);
  var ViewState={
    start:0,
    end:0,
    index:-1,
    students:[],
    img:""
  };
  const [viewState,updateViewState]=React.useState({
    start:0,
    end:0,
    index:-1,
    students:[],
    img:""
  });
  const onTimelineChange = (selectedTimeline) => {
    setSelectedTimeline(selectedTimeline);
  };
  React.useEffect(() => {
    GetTimeline().then(
      (timelines) => {
        setTimelines(timelines);
      },
      (exception) => {
        alert(exception);
      }
    );
  }, []);
  //A one time act
  React.useEffect(() => {
    GetStudents(selectedTimeline).then(
      (studentsCollection) => {
        if (studentsCollection.length > 0) {
          setStudents(studentsCollection);
          ViewState.start=0;
          ViewState.end=studentsCollection.length-1;
          ViewState.index=0;
          ViewState.students=studentsCollection;
          ViewState.img=studentsImages(`./${ViewState.students[ViewState.index].img}`);
          updateViewState({start:ViewState.start,end:ViewState.end,index:ViewState.index,students:ViewState.students,img:ViewState.img});
          //console.log("View State : "+JSON.stringify(viewState));
        }
      },
      (exception) => {
        alert(exception);
      }
    );
  }, [selectedTimeline]);
  return (
    <div>
      <HeaderComponent />
      <GridComponent
        timeline={timelines}
        onTimelineChange={onTimelineChange}
        viewState={viewState}        
      />
    </div>
  );
};

//The central component made to show timeline panel and viewer panel
const GridComponent = ({ timeline, onTimelineChange, viewState}) => {
  const onTLChange = (selectedTimelineDate) => {
    onTimelineChange(selectedTimelineDate);
  };
  return (
    <div>
      <center>
        <div className="gridLayout">
          <TimelineComponent
            timeline={timeline}
            onTimelineChange={onTLChange}
          />
          <ViewerComponent viewState={viewState}/>
        </div>
      </center>
    </div>
  );
};
//Viewer Component is responsible for show casing the details of students with navigation controls available in a particular month of year selected.
const ViewerComponent = ({viewState}) => {
  var headingTitle="";
  if(viewState.students.length>0) headingTitle=viewState.students[0].joiningDate;
  return (
    <div className="viewer">
      {headingTitle!="" && <StudentViewTitleComponent title={headingTitle}/>}
      <NavigationComponent viewState={viewState}/>
    </div>
  );
};
//Navigation Component provides forward/backward controls to access available student
const NavigationComponent = ({viewState}) => {
  const [student,setStudent]=React.useState({name:"",img:""});
  const [state,setState]=React.useState({start:viewState.start,end:viewState.end,index:viewState.index,students:viewState.students});
  //console.log(JSON.stringify(viewState));
  const onNavigationControlClicked=(ev)=>{
    var currentIndex=viewState.index;
    if(ev.currentTarget.id=="forward")
    {
      if(currentIndex<0) currentIndex=0;
      else currentIndex++;
      if(currentIndex>viewState.end) currentIndex=viewState.end;
    }
    else
    {
      currentIndex--;
      if(currentIndex<=0) currentIndex=0;
    }
    viewState.index=currentIndex;
    viewState.img=studentsImages(`./${viewState.students[viewState.index].img}`);
    setState({start:viewState.start,end:viewState.end,index:viewState.index,students:viewState.students});
    setStudent({name:viewState.students[viewState.index].name,img:studentsImages(`./${viewState.students[viewState.index].img}`)});
    //console.log(viewState.students[viewState.index].name);
  }
  //{viewState.index!=-1 && <span>{viewState.students[viewState.index].name}</span>}
  return (
    <div>
    <div className="studentViewSection">
      {viewState.index!=-1 && <img className="studentImage" src={viewState.img.default} />}
    </div>
    {viewState.index!=-1 && <StudentViewInformationComponent studentInfo={{name:viewState.students[viewState.index].name,company:viewState.students[viewState.index].company}}/>}
    {viewState.index!=-1 &&<div className="navigationControls">
        {viewState.index>viewState.start && <button
          type="button"
          id="backward"
          className="leftNavigationButton"
          onClick={onNavigationControlClicked}
        >
          <FontAwesomeIcon icon={faArrowCircleLeft} />
        </button>}
        {viewState.index>=0 && viewState.index!=viewState.end && <button
          type="button"
          id="forward"
          className="rightNavigationButton"
          onClick={onNavigationControlClicked}
        >
          <FontAwesomeIcon icon={faArrowCircleRight} />
        </button>}
    </div>
    }
    </div>
  );
};
//A inner component to showcase information of student related to company & name
//It can be customised accordingly
const StudentViewInformationComponent=({studentInfo})=>{
  //console.log(JSON.stringify(studentInfo));
  return(
    <div className="studentViewInformationSection">
      <h6><FontAwesomeIcon icon={faUser} />&nbsp;&nbsp;Name : &nbsp;&nbsp;<strong>{studentInfo.name}</strong>
      <br/><br/>
      <FontAwesomeIcon icon={faBuilding} />&nbsp;&nbsp;Company : &nbsp;&nbsp;<strong>{studentInfo.company}</strong>
      </h6>
    </div>
  )
}
//An inner component to showcase title of selected month of year available in timline panel
const StudentViewTitleComponent=({title})=>{
  return(
    <div className="studentViewTitleSection">
      <span>[Placements - {title}]</span>
    </div>
  )
}
//Timeline component is responsible to showcase the available month's & its year in which students are placed
//It is associated with joining date of students in a cluster of month's
const TimelineComponent = ({ timeline, onTimelineChange }) => {
  const onChanged = (ev) => {
    onTimelineChange(ev.target.id);
  };
  return (
    <div className="timeline">
      <span>T i m e l i n e</span>
      <hr className="separator"></hr>
      <ul>
        {timeline.map((tl, index) => {
          return (
            <span>
              <li onClick={onChanged} id={tl.date} key={index}>
                {tl.date}
              </li>
              <hr className="separatorForTimeline" />
            </span>
          );
        })}
      </ul>
    </div>
  );
};
//A basic component to show header section of landing page
const HeaderComponent = () => {
  return (
    <div className="header">
      <center>
        <h2>
          <FontAwesomeIcon icon={faUsers} />
          &nbsp; &nbsp; Student Viewer
        </h2>
      </center>
    </div>
  );
};

export default AppExample8;
