import { memo } from 'react';

import "../../assets/scss/component/shared/_friend-request-loader.scss"

const FriendRequestLoader = () => {
    return (
        <div className='friend-request-settings-loader'>
            <div className='fr-basic-loader d-flex'>
                <header className='fr-basic-setting w-100'>
                    <section>
                        <div className='basic-setting-value fr-setting-skeleton'></div>
                    </section>
                </header>
                <div className='fr-basic-setting'>
                    <figure className='fr-setting-skeleton'></figure>
                    <section>
                        <div className='basic-setting-header fr-setting-skeleton'></div>
                        <div className='basic-setting-value fr-setting-skeleton'></div>
                    </section>
                </div>
                <div className='fr-basic-setting'>
                    <figure className='fr-setting-skeleton'></figure>
                    <section>
                        <div className='basic-setting-header fr-setting-skeleton'></div>
                        <div className='basic-setting-value fr-setting-skeleton'></div>
                    </section>
                </div>
                <div className='fr-basic-setting'>
                    <figure className='fr-setting-skeleton'></figure>
                    <section>
                        <div className='basic-setting-header fr-setting-skeleton'></div>
                        <div className='basic-setting-value fr-setting-skeleton'></div>
                    </section>
                </div>
                <div className='fr-basic-setting'>
                    <figure className='fr-setting-skeleton'></figure>
                    <section>
                        <div className='basic-setting-header fr-setting-skeleton'></div>
                        <div className='basic-setting-value fr-setting-skeleton'></div>
                    </section>
                </div>
                <div className='fr-basic-setting w-100'>
                    <figure className='fr-setting-skeleton'></figure>
                    <section>
                        <div className='basic-setting-header fr-setting-skeleton'></div>
                        <div className='basic-setting-value fr-setting-skeleton'></div>
                    </section>
                </div>
                <div className='fr-basic-setting w-100'>
                    <figure className='fr-setting-skeleton'></figure>
                    <section>
                        <div className='basic-setting-header fr-setting-skeleton'></div>
                        <div className='basic-setting-value fr-setting-skeleton'></div>
                    </section>
                </div>
            </div>
            <div className='fr-advanced-loader fr-setting-skeleton'></div>
        </div>
    );
};

export default memo(FriendRequestLoader);