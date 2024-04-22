
import ImageWMS from 'ol/source/ImageWMS.js';
import ImageLayer from 'ol/layer/Image.js';

export const initialBandsState = {
    encUsageBands: [
        { band: '1', value: 'Overview', selected: true },
        { band: '2', value: 'General', selected: true },
        { band: '3', value: 'Coastal', selected: true },
        { band: '4', value: 'Approach', selected: true },
        { band: '5', value: 'Harbor', selected: true },
        { band: '6', value: 'Berthing', selected: true },
    ],
};

export const visibleSelectedSource = (olMap, layerTitle) => {
    const layersList = olMap.getLayers().getArray();
    layersList.forEach(async function (lyr) {
        if (lyr instanceof ImageLayer && lyr.getSource() instanceof ImageWMS) {
            if (layerTitle === lyr.get('title')) {
                lyr.setVisible(true);
                var params = lyr.getSource().getParams();
                params.cql_filter = null;
                lyr.getSource().updateParams(params);
            }
        }
    });
};

export const handleBandToggle = (event, type, olMap, bands, agencyCode, layerTitle) => {

    const layersList = olMap.getLayers().getArray();
    const { name, checked } = event.target;

    const seletedBands = bands[type].map(opt => ({
        ...opt,
        selected: opt.band === name ? !opt.selected : opt.selected,
    }));

    // Create a CQL filter string based on the selected bands and country.
    const filterString = seletedBands
        .filter(opt => opt.selected)
        .map(opt => `navusage IN ('${opt.band}') AND producercode='${agencyCode}'`)
        .join(' OR ');

    const finalFilterString = `(${filterString})`;

    for (const lyr of layersList) {
        if (lyr instanceof ImageLayer && lyr.getSource() instanceof ImageWMS) {
            if (layerTitle === lyr.get('title')) {
                lyr.setVisible(true);
                const params = lyr.getSource().getParams();
                params.cql_filter = finalFilterString;
                lyr.getSource().updateParams(params);
            }
        }
    }

    return { filterString: finalFilterString, newbands: seletedBands };
};


export const handleSelectAllToggle = (checked, type, olMap, bands, layerTitle, agencyCode) => {

    const layersList = olMap.getLayers().getArray();
    var filterString = '';
    let seletedBands = [...bands[type]];

    if (!checked) {
        seletedBands = seletedBands.map(opt => ({ ...opt, selected: false }));
        layersList.forEach(async function (lyr) {
            if (lyr instanceof ImageLayer && lyr.getSource() instanceof ImageWMS) {
                if (layerTitle === lyr.get('title')) {
                    lyr.setVisible(false);
                }
            }
            filterString = 'UnSelectedAll';
        });
    } else {
        seletedBands = seletedBands.map(opt => ({ ...opt, selected: true }));
        visibleSelectedSource(olMap, layerTitle);
        const string = seletedBands.map(opt => `navusage IN ('${opt.band}') AND producercode='${agencyCode}'`).join(' OR ');
        filterString = `(${string})`
    }

    return { filterString: filterString, newbands: seletedBands };
};



