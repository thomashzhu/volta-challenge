import React from 'react';
import {
  Animated,
  FlatList,
  ListRenderItemInfo,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Feature, Point } from 'geojson';
import cities from 'cities';

import { VoltaSite, CitiesResponse } from '../values/types';
import { colors } from '../values/colors';
import { strings } from '../values/strings';
import { Divider } from '../components/Divider';
import { SearchInput } from '../components/SearchInput';
import { SearchResultItem } from '../components/SearchResultItem';
import { getChargerCount } from '../utils/supercluster';

const keyExtractor = (data: Feature<Point, VoltaSite> | CitiesResponse) =>
  (data as CitiesResponse).zipcode ||
  (data as Feature<Point, VoltaSite>).properties.id;

type Props = {
  data: Array<Feature<Point, VoltaSite>>;
  onDismiss: () => void;
  onSelect: (data: Feature<Point, VoltaSite> | CitiesResponse) => void;
  placeholder: string;
  style?: StyleProp<ViewStyle>;
};
const DEFAULT_PROPS = {
  style: {},
};

type State = {
  result: Array<Feature<Point, VoltaSite> | string>;
  searchValue: string;
};

export class SearchScreen extends React.Component<Props, State> {
  static defaultProps = DEFAULT_PROPS;

  opacity = new Animated.Value(0);
  state = {
    result: [],
    searchValue: '',
  };

  componentDidMount() {
    Animated.timing(this.opacity, {
      duration: 200,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }

  handleChangeText = (searchValue: string) => {
    const { data } = this.props;
    const input = searchValue.toLowerCase();
    const sitesResult = searchValue
      ? data
          .filter(d => d.properties.name.toLowerCase().indexOf(input) !== -1)
          .filter(d => d.properties.chargers)
      : [];

    const zipCode = Number(searchValue);
    const isZipCode =
      !Number.isNaN(Number(searchValue)) &&
      zipCode >= 10000 &&
      zipCode <= 99999;
    const cityResponse = isZipCode ? cities.zip_lookup(zipCode) : undefined;
    const cityResult = isZipCode && cityResponse ? [cityResponse] : [];

    this.setState({
      result: [...sitesResult, ...cityResult],
      searchValue,
    });
  };

  handleSearchItemPress = (
    data: Feature<Point, VoltaSite> | CitiesResponse
  ) => {
    const { onSelect } = this.props;
    onSelect(data);
  };

  renderSearchItem = (
    info: ListRenderItemInfo<Feature<Point, VoltaSite> | CitiesResponse>
  ) => {
    const { item } = info;
    const isSiteData = 'properties' in item;

    if (isSiteData) {
      const site = item as Feature<Point, VoltaSite>;
      const {
        properties: { chargers, name },
      } = site;
      const { available, total, level } = getChargerCount(chargers);

      const descriptionStyle = {
        color: `${
          !available ? colors.hint.lighten(0.15) : colors.secondary.darken(0.4)
        }`,
      };

      /* prettier-ignore */
      return (
        <SearchResultItem
          onPress={() => this.handleSearchItemPress(site)}
          row1Text={name}
          row2Style={descriptionStyle}
          row2Text={strings.siteDescription(available, total, level)}
        />
      );
    } else {
      const location = item as CitiesResponse;
      const { zipcode, state_abbr, city } = location;

      /* prettier-ignore */
      return (
        <SearchResultItem
          onPress={() => this.handleSearchItemPress(location)}
          row1Text={zipcode}
          row2Style={styles.cityState}
          row2Text={`${city}, ${state_abbr}`}
        />
      );
    }
  };

  render() {
    const { placeholder, style } = this.props;
    const { result, searchValue } = this.state;

    const opacityStyle = {
      opacity: this.opacity,
    };

    /* prettier-ignore */
    return (
      <Animated.View style={[styles.container, style, opacityStyle]}>
        <SearchInput
          blurOnSubmit
          onChangeText={this.handleChangeText}
          placeholder={placeholder}
          value={searchValue}
        />

        {!!result.length && (
          <FlatList
            data={result}
            ItemSeparatorComponent={Divider}
            keyExtractor={keyExtractor}
            renderItem={this.renderSearchItem}
            style={styles.list}
          />
        )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${colors.white}`,
    flex: 1,
  },
  list: {
    marginTop: 8,
  },
  cityState: {
    color: `${colors.hint.lighten(0.15)}`,
  },
});
