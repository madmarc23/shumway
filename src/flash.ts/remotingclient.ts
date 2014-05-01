/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module Shumway.Remoting.Client {
  import MessageTag = Shumway.Remoting.MessageTag;
  import UpdateFrameTagBits = Shumway.Remoting.UpdateFrameTagBits;

  import DisplayObject = Shumway.AVM2.AS.flash.display.DisplayObject;
  import DisplayObjectFlags = Shumway.AVM2.AS.flash.display.DisplayObjectFlags;
  import DisplayObjectContainer = Shumway.AVM2.AS.flash.display.DisplayObjectContainer;

  import IDataInput = Shumway.AVM2.AS.flash.utils.IDataInput;
  import IDataOutput = Shumway.AVM2.AS.flash.utils.IDataOutput;

  export class ClientVisitor implements IChannelVisitor {
    public output: IDataOutput;

    public writeReferences: boolean = false;
    public clearDirtyBits: boolean = false;

    visitDisplayObject(obj) {
      var dispObj : DisplayObject = obj;

      this.output.writeInt(MessageTag.UpdateFrame);
      this.output.writeInt(dispObj._id);
      // TODO create visitDisplayObjectContainer
      this.output.writeInt(DisplayObjectContainer.isType(dispObj) ? 1 : 0);
      var hasMatrix = dispObj._hasFlags(DisplayObjectFlags.DirtyMatrix);
      var hasBounds = dispObj._hasFlags(DisplayObjectFlags.DirtyBounds);
      var hasChildren = this.outputeferences && dispObj._hasFlags(DisplayObjectFlags.DirtyChildren);
      var hasBits = 0;
      hasBits |= hasMatrix   ? UpdateFrameTagBits.HasMatrix   : 0;
      hasBits |= hasBounds   ? UpdateFrameTagBits.HasBounds   : 0;
      hasBits |= hasChildren ? UpdateFrameTagBits.HasChildren : 0;
      this.output.writeInt(hasBits);
      if (hasMatrix) {
        dispObj._matrix.writeExternal(this.output);
      }
      if (hasBounds) {
        dispObj._getContentBounds().writeExternal(this.output);
      }
      if (hasChildren) {
        assert (DisplayObjectContainer.isType(dispObj));
        var children = (<DisplayObjectContainer>dispObj)._children;
        this.output.writeInt(children.length);
        for (var i = 0; i < children.length; i++) {
          this.output.writeInt(children[i]._id);
        }
      }
      if (this.clearDirtyBits) {
        dispObj._removeFlags(DisplayObjectFlags.Dirty);
      }
    }
  }

}