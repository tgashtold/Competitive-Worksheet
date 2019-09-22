import '../styles/main.scss';
import Edit from './views/pages/forms/edit';
import Saved from './views/pages/forms/saved';
import Form from './views/pages/forms/fill-form';
import Header from './views/partials/header';
import Footer from './views/partials/footer';
import Error404 from './views/pages/error404';
import Utils from './helpers/utils';

const Routes = {
    '/': Form,
    '/saved': Saved,
    '/saved/:id': Edit
 };

function router() {
    const headerContainer = document.getElementsByClassName('header')[0],
        contentContainer = document.getElementsByClassName('main')[0],
        footerContainer = document.getElementsByClassName('footer')[0],
        header = new Header(),
        footer = new Footer();

    header.render().then(html => {
        headerContainer.innerHTML = html;
    });

    footer.render().then(html => {
        footerContainer.innerHTML = html;
    });

    const request = Utils.parseRequestURL(),
        parsedURL = `/${request.resource || ''}${request.id ? '/:id' : ''}`,
        page = Routes[parsedURL] ? new Routes[parsedURL] (): new Error404();

    page.getData().then(data => {
        page.render(data).then(html => {
            contentContainer.innerHTML = html;
            page.afterRender();
        });
    });


}

module.hot ? module.hot.accept(router()) : window.addEventListener('load', router);
window.addEventListener('hashchange', router);
