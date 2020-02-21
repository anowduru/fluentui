import * as React from 'react';
import { Checkbox, css, ISize, fitContentToBounds, Icon } from 'office-ui-fabric-react';
import {
  SignalField,
  Signal,
  NewSignal,
  SharedSignal,
  MentionSignal,
  Tile,
  getTileLayout,
  renderTileWithLayout
} from '@uifabric/experiments';
import { lorem } from '@uifabric/example-data';
import * as TileExampleStylesModule from './Tile.Example.scss';

const ITEMS: { name: JSX.Element; activity: JSX.Element }[] = [
  {
    name: <>{lorem(2)}</>,
    activity: (
      <>
        <span className={TileExampleStylesModule.activityBlock}>267&#x205F;&times;&#x205F;200&ensp;&middot;&ensp;3.14&nbsp;MB</span>
        <SignalField
          before={[
            <Signal key={0}>
              <Icon iconName="play" />
            </Signal>,
            <MentionSignal key={1} />
          ]}
        >
          {lorem(6)}
        </SignalField>
      </>
    )
  },
  {
    name: <>{lorem(2)}</>,
    activity: (
      <>
        <span className={TileExampleStylesModule.activityBlock}>200&#x205F;&times;&#x205F;267&ensp;&middot;&ensp;3.14&nbsp;MB</span>
        <SignalField
          before={[
            <Signal key={0}>
              <Icon iconName="play" />
            </Signal>,
            <SharedSignal key={1} />
          ]}
        >
          {lorem(6)}
        </SignalField>
      </>
    )
  },
  {
    name: <>{lorem(2)}</>,
    activity: (
      <>
        <span className={TileExampleStylesModule.activityBlock}>200&#x205F;&times;&#x205F;200&ensp;&middot;&ensp;3.14&nbsp;MB</span>
        <SignalField
          before={[
            <Signal key={0}>
              <Icon iconName="play" />
            </Signal>,
            <MentionSignal key={1} />
          ]}
        >
          {lorem(6)}
        </SignalField>
      </>
    )
  },
  {
    name: <>{lorem(2)}</>,
    activity: (
      <>
        <span className={TileExampleStylesModule.activityBlock}>180&#x205F;&times;&#x205F;180&ensp;&middot;&ensp;3.14&nbsp;MB</span>
        <SignalField
          before={[
            <Signal key={0}>
              <Icon iconName="play" />
            </Signal>,
            <SharedSignal key={1} />
          ]}
        >
          {lorem(6)}
        </SignalField>
      </>
    )
  }
];

// tslint:disable-next-line:no-any
const TileExampleStyles = TileExampleStylesModule as any;

interface IImageTileProps {
  tileSize: ISize;
  originalImageSize: ISize;
  showBackground: boolean;
  nameplateOnlyOnHover: boolean;
  item: typeof ITEMS[0];
}

const ImageTile: React.FunctionComponent<IImageTileProps> = (props: IImageTileProps): JSX.Element => {
  const tile = (
    <Tile
      contentSize={props.tileSize}
      itemName={<SignalField before={<NewSignal />}>{props.item.name}</SignalField>}
      itemActivity={props.item.activity}
      background={
        <span /> // Placeholder content
      }
      hideBackground={!props.showBackground}
      showBackgroundFrame={true}
      nameplateOnlyOnHover={props.nameplateOnlyOnHover}
    />
  );

  const { backgroundSize } = getTileLayout(tile);

  const imageSize = fitContentToBounds({
    contentSize: props.originalImageSize,
    boundsSize: backgroundSize || { width: 0, height: 0 },
    mode: 'cover'
  });

  return (
    <div
      className={css(TileExampleStyles.tile)}
      // tslint:disable-next-line:jsx-ban-props
      style={{
        width: `${props.tileSize.width}px`,
        height: `${props.tileSize.height}px`
      }}
    >
      {renderTileWithLayout(tile, {
        background: (
          <img
            className={css(TileExampleStyles.tileImage)}
            src={`//placehold.it/${Math.round(imageSize.width)}x${Math.round(imageSize.height)}`}
          />
        )
      })}
    </div>
  );
};

export interface ITileMediaExampleState {
  imagesLoaded: boolean;
  nameplateOnlyOnHover: boolean;
}

export class TileMediaExample extends React.Component<{}, ITileMediaExampleState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      imagesLoaded: true,
      nameplateOnlyOnHover: false
    };
  }

  public render(): JSX.Element {
    const { imagesLoaded, nameplateOnlyOnHover } = this.state;

    return (
      <div>
        <Checkbox label="Show images as loaded" checked={imagesLoaded} onChange={this._onImagesLoadedChanged} />
        <Checkbox label="Show nameplate only on hover" checked={nameplateOnlyOnHover} onChange={this._onNameplateOnlyOnHoverChanged} />
        <h3>Landscape</h3>
        <ImageTile
          tileSize={{
            width: 250,
            height: 200
          }}
          item={ITEMS[0]}
          originalImageSize={{
            width: 400,
            height: 300
          }}
          showBackground={imagesLoaded}
          nameplateOnlyOnHover={nameplateOnlyOnHover}
        />
        <h3>Portrait</h3>
        <ImageTile
          tileSize={{
            width: 200,
            height: 250
          }}
          item={ITEMS[1]}
          originalImageSize={{
            width: 300,
            height: 400
          }}
          showBackground={imagesLoaded}
          nameplateOnlyOnHover={nameplateOnlyOnHover}
        />
        <h3>Small Image</h3>
        <ImageTile
          tileSize={{
            width: 200,
            height: 200
          }}
          item={ITEMS[2]}
          originalImageSize={{
            width: 16,
            height: 16
          }}
          showBackground={imagesLoaded}
          nameplateOnlyOnHover={nameplateOnlyOnHover}
        />
        <h3>No preview</h3>
        <div className={css(TileExampleStyles.tile, TileExampleStyles.largeTile)}>
          <Tile
            itemName={<SignalField before={<NewSignal />}>{ITEMS[3].name}</SignalField>}
            itemActivity={ITEMS[3].activity}
            foreground={<Icon iconName="play" style={{ margin: '11px', fontSize: '40px' }} />}
            showBackgroundFrame={true}
            nameplateOnlyOnHover={this.state.nameplateOnlyOnHover}
          />
        </div>
      </div>
    );
  }

  private _onImagesLoadedChanged = (event: React.FormEvent<HTMLInputElement>, checked: boolean): void => {
    this.setState({
      imagesLoaded: checked
    });
  };

  private _onNameplateOnlyOnHoverChanged = (event: React.FormEvent<HTMLInputElement>, checked: boolean): void => {
    this.setState({
      nameplateOnlyOnHover: checked
    });
  };
}
