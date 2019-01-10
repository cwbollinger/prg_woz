class RobotMarker {
  constructor(robotName, color, size=1) {
    this.name = robotName;
    this.color = color;
    this.size = size;
    this.marker_width = size; this.marker_height = size; this.graphic = null;
    this.scalingFactor = 0.1;
  }

  updateScaling(scaleX, scaleY) {
    this.marker_width = this.size/scaleX;
    this.marker_height = this.size/scaleY;
    let graphic = new createjs.Graphics();
    graphic.setStrokeStyle(1);
    graphic.beginFill(createjs.Graphics.getRGB(255,0,0));
    graphic.drawEllipse(-this.marker_width/2,-this.marker_height/2,this.marker_width,this.marker_height);
    this.marker = new createjs.Shape(graphic);
    this.markerText = new createjs.Text(this.name, '12px Arial', this.color);
    let bounds = this.markerText.getBounds();
    this.markerText.setTransform(this.markerText.x-this.scalingFactor*bounds.width/2, this.markerText.y-this.scalingFactor*bounds.height, this.scalingFactor, this.scalingFactor);
  }

  setLocation(x, y, theta=0) {
    this.marker.x = x;
    this.marker.y = y;
    this.marker.rotation = theta;
    let bounds = this.markerText.getTransformedBounds();
    this.markerText.setTransform(x-bounds.width/2, y-bounds.height, this.scalingFactor, this.scalingFactor);
  }

  addMarker(viewer) {
    viewer.addObject(this.marker);
    viewer.addObject(this.markerText);
  }
}

export function initMap(rosClient) {
  // Create the main viewer.
  var viewer = new ROS2D.Viewer({
    divID : 'cmd-div',
    width : 500,
    height : 500
  });

  // Setup the map client.
  var gridClient = new ROS2D.OccupancyGridClient({
    rosClient : rosClient,
    rootObject : viewer.scene,
    // Use this property in case of continuous updates			
    continuous: true
  });

  // Scale the canvas to fit to the map
  gridClient.on('change', function() {
    viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
    viewer.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y);
  });

  let marker = new RobotMarker('test', 'red', 0.5);
  marker.updateScaling(viewer.scene.scaleX, viewer.scene.scaleY);
  marker.addMarker(viewer);

  function onPoseUpdate(tf) {
    //console.log(tf);
    marker.setLocation(tf.translation.x, -tf.translation.y);
  }

  rosClient.connection.getInstance().then((rosInstance)=>{
    var tfClient = new ROSLIB.TFClient({
      ros : rosInstance,
      fixedFrame : '/map',
      angularThres : 0.01,
      transThres : 0.01
    });
    tfClient.subscribe('base_link', onPoseUpdate);

    // on future connect events, rewire the tfClient to use the current rosInstance
    rosClient.on('connected', function(rosInstance) {
      tfClient.unsubscribe('base_link');
      tfClient = new ROSLIB.TFClient({
        ros : rosInstance,
        fixedFrame : '/map',
        angularThres : 0.01,
        transThres : 0.01
      });
      tfClient.subscribe('base_link', onPoseUpdate);
    });
  });

  var nav_goal = null;
  var nav_marker_width = 1;
  var nav_marker_height = 1;

  rosClient.topic.subscribe('/move_base/current_goal', 'geometry_msgs/PoseStamped', function(msg) {
    console.log(msg);
    if(nav_goal == null) {
      var dot_graphic = new createjs.Graphics();
      dot_graphic.setStrokeStyle(1);
      dot_graphic.beginFill(createjs.Graphics.getRGB(0,255,0));
      nav_marker_width = 20/viewer.scene.scaleX;
      nav_marker_height = 20/viewer.scene.scaleY;
      dot_graphic.drawEllipse(-nav_marker_width/2,-nav_marker_height/2,nav_marker_width,nav_marker_height);
      nav_goal = new createjs.Shape(dot_graphic);
      viewer.addObject(nav_goal);
    }
  });

  var s = null;
  var marker_width = 0;
  var marker_height = 0;
  var x_click_map = 0;
  var y_click_map = 0;

  viewer.scene.on("stagemousedown", function(evt) {
    console.log(evt);
    let x_offset = gridClient.currentGrid.pose.position.x;
    let y_offset = gridClient.currentGrid.pose.position.y;
    console.log(x_offset + ', ' +  y_offset);
    x_click_map = evt.stageX/viewer.scene.scaleX+x_offset;
    y_click_map = evt.stageY/viewer.scene.scaleY+y_offset+2.2; //why is this 2.2 offset needed to make the cursor work??
    //console.log('Transformed click coordinates');
    console.log(x_click_map + ', ' +  y_click_map);
  });

  viewer.scene.on("stagemouseup", function(evt) {
    console.log('MOUSE UP DETECTED!');
    let x_offset = gridClient.currentGrid.pose.position.x;
    let y_offset = gridClient.currentGrid.pose.position.y;
    console.log(x_offset + ', ' +  y_offset);
    let x_release_map = evt.stageX/viewer.scene.scaleX+x_offset;
    let y_release_map = evt.stageY/viewer.scene.scaleY+y_offset+2.2; //why is this 2.2 offset needed to make the cursor work??

    let dx = x_release_map - x_click_map;
    let dy = -1 * (y_release_map - y_click_map);
    let heading = Math.atan(dy, dx);
    console.log(`heading: ${heading}`);
    let w = Math.cos(heading / 2.0);
    let x = 0;
    let y = 0;
    let z = Math.sin(heading / 2.0);
    console.log(`w: ${w}`);
    console.log(`x: ${x}`);
    console.log(`y: ${y}`);
    console.log(`z: ${z}`);
    let o_quaternion = {
      x: x,
      y: y,
      z: z,
      w: w
    };

    if(s == null) {
      var dot_graphic = new createjs.Graphics();
      dot_graphic.setStrokeStyle(1);
      dot_graphic.beginFill(createjs.Graphics.getRGB(0,0,255));
      marker_width = 10/viewer.scene.scaleX;
      marker_height = 10/viewer.scene.scaleY;
      dot_graphic.drawEllipse(-marker_width/2,-marker_height/2,marker_width,marker_height);
      s = new createjs.Shape(dot_graphic);
      viewer.addObject(s);
    }
    s.x = x_click_map;
    s.y = y_click_map;

    rosClient.topic.publish('/move_base_simple/goal', 'geometry_msgs/PoseStamped', {
      header: {
        frame_id: 'map'
      },
      pose: {
        position: {
          x: x_click_map,
          y: -y_click_map,
          z: 0.0
        },
        orientation: o_quaternion
      }
    });
  });
}
