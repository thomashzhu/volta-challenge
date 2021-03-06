import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

import { ProgressBar } from './ProgressBar';
import { colors } from '../values/colors';
import { strings } from '../values/strings';
import { HORIZONTAL_SPACE, VERTICAL_SPACE } from '../values/constants';
import { VoltaSite } from '../values/types';
import { getChargerCount } from '../utils/supercluster';

const SUMMARY_HEIGHT = 184;

type Props = {
  onPress: () => void;
  site: VoltaSite;
};

export const SiteSummary: React.FunctionComponent<Props> = props => {
  const { onPress, site } = props;
  const { available, total, level } = getChargerCount(site.chargers);

  /* prettier-ignore */
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.summary}>
        <Text ellipsizeMode="tail" numberOfLines={2} style={styles.siteName}>
          {site.name}
        </Text>

        <View style={styles.progressBar}>
          <ProgressBar percent={available / total} />
        </View>

        <Text style={styles.chargers}>
          {strings.siteDescription(available, total, level)}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  summary: {
    height: SUMMARY_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_SPACE,
    paddingVertical: VERTICAL_SPACE * 1.5,
  },
  siteName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'left',
  },
  progressBar: {
    borderRadius: 12,
    height: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  chargers: {
    color: `${colors.hint}`,
    fontSize: 14,
    textAlign: 'left',
    textTransform: 'uppercase',
  },
});
