<?php
class NRRestfulService extends RestfulService {
    /**
     * Returns a full request url
     * @param string
     */
    public function getAbsoluteRequestURL($subURL = '') {
        $url=Controller::join_links($this->baseURL, $subURL, '?' . $this->queryString);
    
        return preg_replace('/\%5B\d+\%5D/', '%5B%5D', str_replace(' ', '%20', $url)); // Encode spaces
    }
}
?>