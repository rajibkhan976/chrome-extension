import React, { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";


import DraggableListItem from "./DraggableListItem";
import { prioritySubDMFValue } from "../../../service/messages/MessagesServices";

const DraggableList = (props) => {
   
  const [data, setdata] = useState(props.data.sub_dmfs.slice(1));
  const iconColorArr=["#ee37ff","#ff8f6b","#605bbf","#26bfe2"]
  

  useEffect(() => {
    setdata(props.data.sub_dmfs.slice(1));
  }, [props]);

  const [dragStartIndex, setdragStartIndex] = useState(null);

  // get index of draged item
  const onDragStart = (index) => setdragStartIndex(index);

  // update list when item dropped
  const onDrop = (dropIndex) => {
    let updateDMFPayload;
    // get draged item
    const dragItem = data[dragStartIndex];

    // delete draged item in list
    let list = [...data];
    list.splice(dragStartIndex, 1);

    // update list
    if (dragStartIndex < dropIndex) {
      let newList = [
        ...list.slice(0, dropIndex - 1),
        dragItem,
        ...list.slice(dropIndex - 1, list.length),
      ];
      newList = newList.map((item, index) => {
        return { ...item, priority: index };
      });
      // console.log("it is dragging bro", newList);
      setdata(newList);
      updateDMFPayload = newList.map(el => ({
        "sub_dmf_id": el._id,
        "priority": el.priority + 1
      }))
      props.setDataObj({
        ...props.data,
        sub_dmfs: [props.data.sub_dmfs[0],...newList],
      });
      (prioritySubDMFValue(updateDMFPayload))
      .then((res) => {
        if(res) {
          // console.log('subdmf updated else');
          // console.log("if List", data);
        }
      })
 
    } else {
      let newList = [
        ...list.slice(0, dropIndex),
        dragItem,
        ...list.slice(dropIndex, list.length),
      ];
      newList = newList.map((item, index) => {
        return { ...item, priority: index };
      });
      // console.log("it is dragging bro", newList);
      setdata(newList);
      updateDMFPayload = newList.map(el => ({
        "sub_dmf_id": el._id,
        "priority": el.priority + 1
      }))

      props.setDataObj({ ...props.data, sub_dmfs: [props.data.sub_dmfs[0],...newList]});
      (prioritySubDMFValue(updateDMFPayload))
     .then((res) => {
       if(res) {
        //  console.log('subdmf updated else');
        //  console.log("else List", data);
       }
     })

    }
  };

  return (
    <ul className="draggable-list">

<DraggableListItem
            key={'default'+0}
            index={0}
            onDragStart={() => onDragStart(0)}
            onDrop={() => onDrop(0)}
            onClickFun={() => {
                props.onClickFun(props.data.sub_dmfs[0])
            }}
            draggable={props.data.sub_dmfs[0].subdmf_name !== "Default"}
          >
               {/* <DragHoldIcon /> */}
               {props.renderItemContent(props.data.sub_dmfs[0],props.activeObjId===props.data.sub_dmfs[0]._id?true:false,"#edf0f9")}
          </DraggableListItem>


        {data?.length>0&&data.sort((a, b) => (a.priority > b.priority) ? 1 : -1).map((item, index) => {
        // console.log('index', item.subdmf_name ==="Default");
        let active=props.activeObjId===item._id?true:false
        // console.log("props.activeObjId===item._id", props.activeObjId, item, item._id);
        return(
          <DraggableListItem
            key={index}
            index={index}
            onDragStart={(index) => onDragStart(index)}
            onDrop={(index) => onDrop(index)}
            onClickFun={() => {
                props.onClickFun(item)
            }}
            draggable={item.subdmf_name !=="Default"}
          >
               {props.renderItemContent(item,active,item.color)}
          </DraggableListItem>
         
      )})}
      {/*
                add last item so you can drag item to last position
                last item dont need onDragStart because it can not be draged
            */}
      <DraggableListItem
        key={data.length}
        index={data.length}
        draggable={false}
        onDrop={(index) => onDrop(index)}
      />
    </ul>
  )};
;

DraggableList.propTypes = {
  data: PropTypes.object,
  renderItemContent: PropTypes.func,
};

export default memo(DraggableList);