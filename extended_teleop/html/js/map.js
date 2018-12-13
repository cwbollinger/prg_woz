
export class RobotMarker {
  constructor(robotName, color, size=1) {
    this.name = robotName;
    this.color = color;
    this.size = size;
    this.marker_width = size;
    this.marker_height = size;
    this.graphic = null;
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
