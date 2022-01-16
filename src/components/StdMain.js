import TopBar from "./TopBar";
import WorkSpace from "./WorkSpace";

function StdMain(props) {
    return (
        <>
            <TopBar title={props.title ? props.title : "Bulkompare"}/>
            <WorkSpace>
                {props.children}
            </WorkSpace>
        </>
    );
}

export default StdMain;
