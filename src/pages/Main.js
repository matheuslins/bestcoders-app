import React, {useEffect, useState} from 'react';

import {StyleSheet, Image, View, Text, TextInput, TouchableOpacity} from 'react-native';
import MapView, {Marker, Callout} from 'react-native-maps';
import {requestPermissionsAsync, getCurrentPositionAsync} from 'expo-location';

import {MaterialIcons} from '@expo/vector-icons';

import api from '../services/api';
import { connect, disconect, subscribeToNewCoders } from '../services/socket';


function Main({navigation}) {
    
    const [coders, setCoders] = useState([]);
    const [currentRegion, setCurrentRegion] = useState(null);
    const [techs, setTechs] = useState('');

    useEffect(() => {
        async function loadInitialposition(){
            const { granted } = await requestPermissionsAsync();

            if (granted){
                const {coords} = await getCurrentPositionAsync({
                    enableHighAccuracy: true
                });

                const { latitude, longitude } = coords;

                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04
                })
            }
        }
        loadInitialposition();
    }, []);

    useEffect(() => {
        subscribeToNewCoders(coder => setCoders([...coders, coder]));
    }, [coders]);

    function setupWebsocket(){
        disconect();

        const { latitude, longitude } = currentRegion;
        connect(
            latitude,
            longitude,
            techs
        );
    }
    async function loadCoders(){
        const {latitude, longitude} = currentRegion;

        const response = await api.get('/search', {
            params: {
                latitude,
                longitude,
                techs
            }
        });
        
        setCoders(response.data.data);
        setupWebsocket()

    }

    function handlerRegionChanged(region){
        setCurrentRegion(region);
    }

    if (!currentRegion){
        return null
    }

    return (
    <>
        <MapView
            onRegionChangeComplete={handlerRegionChanged}
            initialRegion={currentRegion}
            style={styles.map}
        >
            {coders.map(coder => (
                
                <Marker
                    key={coder._id}
                    coordinate={{
                        latitude: coder.location.coordinates[1],
                        longitude: coder.location.coordinates[0]
                    }}>
                    <Image
                        style={styles.avatar}
                        source={{
                            uri: coder.avatar_url
                        }}>

                    </Image>
                    <Callout onPress={() => {
                        navigation.navigate('Profile', { github_username: coder.github_username });
                    }}>
                        <View style={styles.callout}>
                            <Text style={styles.coderName}>{coder.name}</Text>
                            <Text style={styles.coderBio}>{coder.bio}</Text>
                            <Text style={styles.coderTechs}>{coder.techs.join(', ')}</Text>
                        </View>
                    </Callout>
                </Marker>
            ))}
        </MapView>
        <View style={styles.searchForm}>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar coders por techs"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoCorrect={false}
                value={techs}
                onChangeText={setTechs}
            />
            <TouchableOpacity onPress={loadCoders} style={styles.loadButton}>
                <MaterialIcons name="my-location" size={20} color="#FFF"></MaterialIcons>
            </TouchableOpacity>
    
        </View>
    </>

    );
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 4,
        borderWidth: 4,
        borderColor: '#FFF'
    },
    callout: {
        width: 260,
    },
    coderName: {
        fontWeight: 'bold',
        fontSize: 16
    },
    coderBio: {
        color: '#666',
        marginTop: 5
    },
    searchForm: {
        position: 'absolute',
        top: 30,
        left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row'
    },
    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#FFF',
        color: '#333',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 4,
            height: 4
        },
        elevation: 2
    },
    loadButton: {
        width: 50,
        height: 50,
        backgroundColor: '#8E4DFF',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15
    }
})
export default Main;